import { useState, useCallback, useEffect } from "react"
import { Board, Task } from "../../types"
import VerticalBoard from "./VerticalBoardContainer"
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, DragOverEvent, useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { SortableContext, arrayMove } from "@dnd-kit/sortable"
import { createPortal } from "react-dom"
import TaskCard from "./TaskCard"
import useBoards from "../../hooks/useBoards";
import useTasks from "../../hooks/useTasks";
import StagingBoard from "./SideBoard"
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTheme } from '@mui/material/styles';
import VendorColumn from "./Columns/VendorColumn"
import ClientColumn from "./Columns/ClientColumn"
import { Support, Core } from "./Columns/SupportAndCore";
import useSearch from "../../hooks/useSearch"
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Sheet_Uploader from "../Sheet_Uploader";
import SupportAndCore from "./Columns/SupportAndCore/SupportAndCore"

const KanbanBoard = () => {
    const { columns, setColumns, createNewBoard, deleteBoard, updateBoard, updateBoardsFromJson } = useBoards();
    const { tasks, setTasks, createTask, deleteTask, updateTask, createBulkTasks, moveTaskToStaging } = useTasks();
    const [activeBoard, setActiveBoard] = useState<Board | null>(null)
    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [isStagingCollapsed, setIsStagingCollapsed] = useState(true);
    const [activeSearchTask, setActiveSearchTask] = useState<Task | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'search' | 'staging'>('search');
    const theme = useTheme();
    const [isButtonVisible, setIsButtonVisible] = useState(true);
    const [searchInput, setSearchInput] = useState('');
    const [jsonData, setJsonData] = useState(null);

    useEffect(() => {
        console.log("🚀 ~ KanbanBoard ~ jsonData:", jsonData)
    }, [jsonData])

    const downloadTestData = () => {
        const link = document.createElement('a');
        link.href = '../../../TestData.xlsx';
        link.download = 'testData.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const searchBoard = columns['Search'][0];
    const searchBoardId = searchBoard?.id;

    const handleTabChange = (_: React.SyntheticEvent, newValue: 'search' | 'staging') => {
        setActiveTab(newValue);
    };

    const handleStagingToggle = () => {
        setIsButtonVisible(false);
        setIsStagingCollapsed(!isStagingCollapsed);
        setTimeout(() => {
            setIsButtonVisible(true);
        }, 500);
    };

    const { search } = useSearch(createBulkTasks, searchBoardId);

    useEffect(() => {
        if (searchQuery) {
            setTasks((prevTasks) => {
                const otherTasks = prevTasks.filter(task => task.boardId !== searchBoardId);
                // Perform search
                search(searchQuery);
                return otherTasks;
            });
        } else {
            setTasks((prevTasks) => prevTasks.filter(task => task.boardId !== searchBoardId));
        }
    }, [searchQuery]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 3 }
    }));

    const onDragStart = useCallback((event: DragStartEvent) => {
        console.log("Drag Start", event)
        if (event.active.data.current?.type === "Board") {
            setActiveBoard(event.active.data.current.board);
            return;
        }
        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
        if (event.active.data.current?.type === 'SearchTask') {
            setActiveSearchTask(event.active.data.current.task);
            return;
        }
    }, []);

    const onDragEnd = useCallback(
        (event: DragEndEvent) => {
            setActiveBoard(null);
            setActiveTask(null);
            setActiveSearchTask(null);
            const { active, over } = event;
            if (!over) return;

            const activeId = active.id;
            const overId = over.id;

            if (active.data.current?.type === 'SearchTask') {
                const newTaskContent = active.data.current.task.content;

                if (over.data.current?.type === 'Task') {
                    const overTask = over.data.current.task;
                    const boardId = overTask.boardId;
                    const overIndex = tasks.findIndex((t) => t.id === overId);

                    createTask(boardId, newTaskContent, overIndex);
                    return;
                }

                if (over.data.current?.type === 'Board') {
                    const boardId = overId;
                    createTask(boardId, newTaskContent);
                    return;
                }
            }
            let sourceColumn = '';
            let sourceRow = '';
            let destColumn = '';
            let destRow = '';

            for (const column in columns) {

                if ((columns[column] as Board[]).some(board => board.id === activeId)) {
                    sourceColumn = column;
                }
                if ((columns[column] as Board[]).some(board => board.id === overId)) {
                    destColumn = column;
                }

            }

            if (!sourceColumn || !destColumn) return;

            if (sourceColumn !== destColumn || sourceRow !== destRow) {
                let board: Board | undefined;

                board = (columns[sourceColumn] as Board[]).find(b => b.id === activeId);


                if (board) {

                    (columns[destColumn] as Board[]).push(board);



                    (columns[sourceColumn] as Board[]) = (columns[sourceColumn] as Board[]).filter(b => b.id !== activeId);


                    setColumns({ ...columns });

                    console.log(`Moved Board '${board.title}' from ${sourceColumn}${sourceRow ? ` - ${sourceRow}` : ''} to ${destColumn}${destRow ? ` - ${destRow}` : ''}.`);
                    console.log('Updated Order in Source:', Array.isArray(columns[sourceColumn]) ? (columns[sourceColumn] as Board[]).map(b => b.title) : Object.values(columns[sourceColumn] as { [row: string]: Board[] }).flat().map(b => b.title));
                    console.log('Updated Order in Destination:', Array.isArray(columns[destColumn]) ? (columns[destColumn] as Board[]).map(b => b.title) : Object.values(columns[destColumn] as { [row: string]: Board[] }).flat().map(b => b.title));
                }
            } else {

                setColumns((cols) => ({
                    ...cols,
                    [sourceColumn]: arrayMove(cols[sourceColumn] as Board[],
                        (cols[sourceColumn] as Board[]).findIndex(b => b.id === activeId),
                        (cols[sourceColumn] as Board[]).findIndex(b => b.id === overId)
                    )
                }));
                // Log board reorder within the same column
                // console.log(`Reordered Boards within ${sourceColumn}:`, (cols[sourceColumn] as Board[]).map(b => b.title));

            }
        },
        [columns, tasks, createTask]
    );

    const onDragOver = useCallback(
        (event: DragOverEvent) => {
            const { active, over } = event;
            if (!over) return;

            const activeId = active.id;
            const overId = over.id;

            if (activeId === overId) return;
            const isActiveATask = active.data.current?.type === "Task";
            const isOverATask = over.data.current?.type === "Task";

            if (!isActiveATask) return;

            // dropping a task over another task
            if (isActiveATask && isOverATask) {
                setTasks((tasks) => {
                    const activeIndex = tasks.findIndex((t) => t.id === activeId);
                    const overIndex = tasks.findIndex((t) => t.id === overId);
                    tasks[activeIndex].boardId = tasks[overIndex].boardId
                    const updatedTasks = arrayMove(tasks, activeIndex, overIndex);
                    // Log task reorder within the same board
                    console.log(`Reordered Tasks within Board '${tasks[overIndex].boardId}':`, updatedTasks.filter(t => t.boardId === tasks[overIndex].boardId).map(t => t.content));
                    return updatedTasks;
                })
            }

            const isOverABoard = over.data.current?.type === "Board";
            //dropping a task over another board
            if (isActiveATask && isOverABoard) {
                setTasks((tasks) => {
                    const activeIndex = tasks.findIndex((t) => t.id === activeId);
                    tasks[activeIndex].boardId = overId
                    const updatedTasks = arrayMove(tasks, activeIndex, activeIndex)
                    console.log(`Moved Task '${tasks[activeIndex].content}' to Board '${overId}'.`);
                    return updatedTasks;
                })
            }
        },
        [tasks]
    );

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setSearchQuery(e.currentTarget.value);
        }
    };

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    const handleClear = () => {
        setSearchInput('');
        setSearchQuery('');
    };

    const handleButtonClick = () => {
        console.log("Button clicked!");
    };

    useEffect(() => {
        if (jsonData) {
            updateBoardsFromJson(jsonData);
        }
    }, [jsonData, updateBoardsFromJson]);

    return (
        <>
            <header className="w-full p-1 bg-accentColor text-mainBackgroundColor flex justify-between items-center h-10">
                <h1 className="text-xl font-bold">Kanban Board</h1>
                <div className="flex items-center">
                    <span className="ml-2 text-sm cursor-pointer" onClick={downloadTestData}>See sample</span>
                    <Sheet_Uploader setJsonData={setJsonData} />

                </div>
            </header>
            <div className="m-auto flex h-[calc(100vh-2.5rem)] w-full items-start overflow-hidden bg-mainBackgroundColor">
                <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragOver={onDragOver}>
                    <div className="flex gap-4 w-full h-full">
                        {/* Vendor */}
                        <VendorColumn
                            columns={columns}
                            createNewBoard={createNewBoard}
                            deleteBoard={deleteBoard}
                            updateBoard={updateBoard}
                            createTask={createTask}
                            tasks={tasks}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            isStagingCollapsed={isStagingCollapsed}
                        />
                        {/* Support and Core */}
                        <SupportAndCore
                            columns={columns}
                            createNewBoard={createNewBoard}
                            deleteBoard={deleteBoard}
                            updateBoard={updateBoard}
                            createTask={createTask}
                            tasks={tasks}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            isStagingCollapsed={isStagingCollapsed}
                        />
                        {/* Client */}
                        <ClientColumn
                            columns={columns}
                            createNewBoard={createNewBoard}
                            deleteBoard={deleteBoard}
                            updateBoard={updateBoard}
                            createTask={createTask}
                            tasks={tasks}
                            deleteTask={deleteTask}
                            updateTask={updateTask}
                            isStagingCollapsed={isStagingCollapsed}
                        />
                        {/* Combined Sidebar for Search and Staging */}
                        <div className="relative flex">
                            {/* Toggle Button when staging is collapsed */}
                            {!isStagingCollapsed && isButtonVisible && (
                                <button
                                    onClick={handleStagingToggle}
                                    className="absolute z-20 p-1 bg-accentColor text-mainBackgroundColor hover:scale-110 transition-transform duration-200"
                                    style={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        left: '-24px',
                                        borderRadius: '50% 0 0 50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <ChevronRightIcon />
                                </button>
                            )}

                            {/* Toggle Button when staging is open */}
                            {isStagingCollapsed && isButtonVisible && (
                                <button
                                    onClick={handleStagingToggle}
                                    className="absolute z-20 p-1 bg-accentColor text-mainBackgroundColor hover:scale-110 transition-transform duration-200"
                                    style={{
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        right: '0',
                                        borderRadius: '50% 0 0 50%',
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <ChevronLeftIcon />
                                </button>
                            )}

                            {/* Main sidebar content */}
                            <div className={`flex flex-col h-full overflow-hidden bg-columnBackgroundColor rounded-lg transition-all duration-500 ease-in-out ${isStagingCollapsed ? 'w-8 opacity-100' : 'w-[calc(15vw-1rem)] opacity-100'
                                }`}>
                                {!isStagingCollapsed && (
                                    <>
                                        <Tabs
                                            value={activeTab}
                                            onChange={handleTabChange}
                                            aria-label="Search and Staging Tabs"
                                            indicatorColor="primary"
                                            textColor="primary"
                                            sx={{
                                                backgroundColor: theme.palette.background.paper,
                                                borderRadius: '8px 8px 0 0',
                                                minHeight: '36px',
                                                '& .MuiTab-root': {
                                                    minHeight: '36px',
                                                    fontSize: '0.8rem'
                                                }
                                            }}
                                        >
                                            <Tab label="Search" value="search" />
                                            <Tab label="Staging" value="staging" />
                                        </Tabs>

                                        {/* Tab Panels */}
                                        {activeTab === 'search' && (
                                            <div className="overflow-auto h-full pt-2 px-2">
                                                <div className="flex items-center mb-3 bg-white rounded-md shadow-sm border border-gray-200">
                                                    <SearchIcon className="text-gray-400 ml-2" sx={{ fontSize: 20 }} />
                                                    <input
                                                        type="text"
                                                        placeholder="Search tasks..."
                                                        value={searchInput}
                                                        onChange={(e) => setSearchInput(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSearch();
                                                        }}
                                                        className="w-full p-1.5 text-sm outline-none"
                                                    />
                                                    {searchInput && (
                                                        <button
                                                            onClick={handleClear}
                                                            className="text-gray-400 hover:text-gray-600 p-1"
                                                        >
                                                            <CloseIcon sx={{ fontSize: 16 }} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={handleSearch}
                                                        className="bg-accentColor text-white p-1.5 m-1 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
                                                    >
                                                        <SearchRoundedIcon sx={{ fontSize: 20 }} />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <SortableContext items={(columns['Search'] as Board[]).map(board => board.id)}>
                                                        {(columns['Search'] as Board[]).map(board => (
                                                            <StagingBoard
                                                                key={board.id}
                                                                board={board}
                                                                deleteBoard={deleteBoard}
                                                                updateBoard={updateBoard}
                                                                createTask={createTask}
                                                                tasks={tasks.filter(task => task.boardId === board.id)}
                                                                deleteTask={deleteTask}
                                                                updateTask={updateTask}
                                                                showBookmark={true} // Pass showBookmark prop
                                                                moveTaskToStaging={moveTaskToStaging} // Pass moveTaskToStaging prop
                                                            />
                                                        ))}
                                                    </SortableContext>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'staging' && (
                                            <div className="overflow-auto h-full p-2 space-y-2">
                                                <SortableContext items={(columns['Staging'] as Board[]).map(board => board.id)}>
                                                    {(columns['Staging'] as Board[]).map(board => (
                                                        <StagingBoard
                                                            key={board.id}
                                                            board={board}
                                                            deleteBoard={deleteBoard}
                                                            updateBoard={updateBoard}
                                                            createTask={createTask}
                                                            tasks={tasks.filter(task => task.boardId === board.id)}
                                                            deleteTask={deleteTask}
                                                            updateTask={updateTask}
                                                        />
                                                    ))}
                                                </SortableContext>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {createPortal(
                        <DragOverlay >
                            {activeBoard && (
                                <div className="drag-overlay">
                                    <VerticalBoard
                                        board={activeBoard}
                                        deleteBoard={deleteBoard}
                                        updateBoard={updateBoard}
                                        createTask={createTask}
                                        tasks={tasks.filter((task) => task.boardId === activeBoard.id)}
                                        deleteTask={deleteTask}
                                        updateTask={updateTask}
                                        isOverlay={true}
                                    />
                                </div>
                            )}
                            {activeTask && <TaskCard task={activeTask} deleteTask={deleteTask} updateTask={updateTask} />}
                            {activeSearchTask && (
                                <TaskCard task={activeSearchTask} isSearchTask={true} showBookmark={true} moveTaskToStaging={moveTaskToStaging} />
                            )}
                        </DragOverlay>,
                        document.body
                    )}
                </DndContext>
            </div>
        </>
    )
}

export default KanbanBoard
