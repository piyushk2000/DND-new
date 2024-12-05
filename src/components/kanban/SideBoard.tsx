import { useMemo, useState, useEffect } from "react";
import { Board, Id, Task } from "../../types";
import { useSortable, SortableContext } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { useResponsive, useOrientation } from "../../hooks/useResponsive";

interface Props {
    board: Board;
    tasks: Task[];
    deleteBoard: (id: Id) => void;
    updateBoard: (id: Id, title: string) => void;
    createTask: (boardId: Id) => void;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    isOverlay?: boolean;
    columnsPerRow?: number;
    showBookmark?: boolean;
    moveTaskToStaging?: (id: Id) => void;
}

const StagingBoard = (props: Props) => {
    const [editMode, setEditMode] = useState(false);
    const { board, deleteBoard, updateBoard, createTask, tasks, deleteTask, updateTask, isOverlay, columnsPerRow = 3,showBookmark=false, moveTaskToStaging } = props;

    const { isMobile, isTablet, isDesktop } = useResponsive();
    const { orientation } = useOrientation();


    const adjustedColumnsPerRow = 1;


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
            <div ref={setNodeRef} style={style}
                className="bg-columnBackgroundColor w-full h-52 border border-accentColor max-h-88 rounded-xl flex flex-col mb-4">
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <div ref={setNodeRef} style={{
                ...style,
                height: '100%',
                width: '100%',
                position: 'relative'
            }}
                className={`bg-mainBackgroundColor w-full rounded-xl flex flex-col transition-transform mb-4 ${isOverlay ? 'scale-105' : ''
                    }`}>
                <div className="flex-grow p-2 overflow-auto">
                    <SortableContext items={tasksIds}>
                        {tasks.length === 0 ? (
                            <div className="text-center text-textSecondary h-12 flex items-center justify-center">No tasks available</div>
                        ) : (
                            <div className={`grid gap-2`} style={{
                                gridTemplateColumns: `repeat(${adjustedColumnsPerRow}, minmax(0, 1fr))`
                            }}>
                                {tasks.map((task) => (
                                    <TaskCard key={task.id} task={task} deleteTask={deleteTask} updateTask={updateTask} showBookmark={showBookmark} moveTaskToStaging={moveTaskToStaging} />
                                ))}
                            </div>
                        )}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
}
export default StagingBoard;