import { useMemo, useState, useEffect } from "react";
import TrashIcon from "../../icons/TrashIcon";
import PlusIcon from "../../icons/PlusIcon"; 
import { Board, Id, Task } from "../../types";
import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useResponsive, useOrientation } from "../../hooks/useResponsive";
import { adjustColumnsPerRow } from "../common/helper";
import EditIcon from '@mui/icons-material/Edit'; 

interface Props {
    board: Board;
    tasks: Task[];
    deleteBoard: (id: Id) => void;
    updateBoard: (id: Id, title: string) => void;
    createTask: (boardId?: string | number, content?: string, index?: number) => void;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    isOverlay?: boolean; 
    columnsPerRow?: number; 
    BigColumn?: boolean
}

const VerticalBoard = (props: Props) => {
    const [editMode, setEditMode] = useState(false);
    const { board, deleteBoard, updateBoard, createTask, tasks, deleteTask, updateTask, isOverlay, columnsPerRow = 3, BigColumn = false } = props;

    const { isMobile, isTablet, isDesktop } = useResponsive();
    const { orientation } = useOrientation();


    const adjustedColumnsPerRow = useMemo(() => adjustColumnsPerRow(columnsPerRow, isDesktop, isTablet, isMobile), [isDesktop, isTablet, isMobile]);

    const calculateHeight = () => {
        const baseHeight = 80; 
        if (tasks.length <= adjustedColumnsPerRow && !BigColumn) {
            return baseHeight;
        } else {
            return 130
        }
    };

    const [height, setHeight] = useState(calculateHeight());

    useEffect(() => {
        if (height < 130) {
            setHeight(calculateHeight());
        }
    }, [tasks.length]);

    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: board.id,
        data: { type: "Board", board },
        disabled: editMode,
    });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        boxShadow: isDragging ? '0 4px 14px rgba(0, 0, 0, 0.1)' : 'none',
    };

    const onResize = (_: React.SyntheticEvent, { size }: { size: { width: number; height: number } }) => {
        setHeight(Math.max(size.height, calculateHeight()));
    };

    function handleUpdateBoard(id: Id, title: string) {
        updateBoard(id, title);
        console.log(`Updated board '${id}' title to: '${title}'`);
    }

    function handleDeleteBoard(id: Id) {
        deleteBoard(id);
        console.log(`Deleted board with ID: '${id}'`);
    }

    if (isMobile && orientation === 'portrait') {
        return (
            <div className="flex items-center justify-center h-full">
                <p>Please rotate your screen for a better experience.</p>
            </div>
        );
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} style={{
                ...style,
                height: `${height}px`, 
                width: '100%',
            }}
                className="bg-columnBackgroundColor border border-accentColor rounded-xl flex flex-col mb-4">
            </div>
        )
    }

    return (
        <Resizable
            height={height}
            width={Infinity}
            onResize={onResize}
            minConstraints={[Infinity, calculateHeight()]}
            maxConstraints={[Infinity, 600]}
            handle={<div className="h-2 w-full cursor-row-resize absolute bottom-0 left-0" />}
        >
            <div ref={setNodeRef} style={{
                ...style,
                height: `${height}px`,
                width: '100%',
                position: 'relative'
            }}
                className={`bg-mainBackgroundColor w-full rounded-xl flex flex-col transition-transform mb-2 ${isOverlay ? 'scale-105' : ''
                    }`}>
                {/* Board Title*/}
                <header {...attributes} {...listeners}
                    className="bg-accentColor text-xs h-8 p-0.5 cursor-default rounded-t-xl flex items-center justify-between">
                    <div className="flex items-center gap-1 px-1">
                        {!editMode && (
                            <span className="text-textPrimary font-normal">{board.title}</span>
                        )}
                        {editMode && (
                            <input autoFocus
                                className="bg-transparent focus:border-accentColor border rounded outline-none px-1 text-sm text-textPrimary w-full"
                                value={board.title}
                                onChange={(e) => handleUpdateBoard(board.id, e.target.value)}
                                onBlur={() => { setEditMode(false) }}
                                onKeyDown={(e) => {
                                    if (e.key !== "Enter") return;
                                    setEditMode(false);
                                }} />
                        )}
                    </div>
                    <div className="flex items-center gap-1 px-0.5">
                        <button onClick={() => {
                            createTask((board.id));
                            console.log(`Created new task in board '${board.id}'.`);
                        }}
                            className="stroke-textSecondary hover:stroke-mainBackgroundColor rounded p-0.5 transition-colors">
                            <PlusIcon />
                        </button>
                        <button onClick={() => setEditMode(true)}
                            className="text-textSecondary hover:text-textPrimary rounded p-0.5 transition-colors">
                            <EditIcon fontSize="small" />
                        </button>
                        <button onClick={() => { handleDeleteBoard(board.id) }}
                            className="stroke-textSecondary hover:stroke-mainBackgroundColor rounded p-0.5 transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                </header>
                {/* Board Task Container*/}
                <main className="flex-grow p-1 overflow-auto">
                    <SortableContext items={tasksIds} strategy={rectSortingStrategy}>
                        {tasks.length === 0 ? (
                            <div className="text-center text-textSecondary h-10 flex items-center justify-center">No tasks available</div>
                        ) : (
                            <div className={`grid gap-2`} style={{
                                gridTemplateColumns: `repeat(${adjustedColumnsPerRow}, minmax(0, 1fr))`
                            }}>
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} />
                                ))}
                            </div>
                        )}
                    </SortableContext>
                </main>
            </div>
        </Resizable>
    );
}
export default VerticalBoard;