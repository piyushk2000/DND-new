import { useState } from "react";
import { Id, Task } from "../../types"
import EditIcon from '@mui/icons-material/Edit';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities"

interface Props {
    task: Task;
    deleteTask?: (id: Id) => void;
    updateTask?: (id: Id, content: string) => void;
    isSearchTask?: boolean;
    data?: any;
    showBookmark?: boolean; 
    moveTaskToStaging?: (id: Id) => void; 
}

const TaskCard = ({ task, deleteTask, updateTask, isSearchTask = false, data, showBookmark = false, moveTaskToStaging }: Props) => {

    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: {
            type: isSearchTask ? 'SearchTask' : 'Task',
            task,
        },
    });
    const style = {
        transition,
        transform: CSS.Transform.toString(transform)
    };

    const toggleEditMode = () => {
        setEditMode((prev) => !prev)
    }

    if (isDragging) {
        return <div ref={setNodeRef} style={style}
            className="bg-mainBackgroundColor opacity-30 p-1 h-12 min-h-12 items-center flex rounded-lg border border-accentColor cursor-grab relative" />
    }

    if (editMode) {
        return (
            <div {...attributes} {...listeners}
                ref={setNodeRef} style={style}
                className="bg-mainBackgroundColor p-1 h-12 min-h-12 items-center flex rounded-lg border border-accentColor cursor-grab relative task">
                <textarea className="h-8 w-full resize-none border-none rounded
                bg-transparent text-xs text-textPrimary f
                ocus:outline-none"
                    value={task.content} autoFocus
                    placeholder="Task content here"
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.shiftKey && e.key === "Enter") toggleEditMode();
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                ></textarea>
            </div>
        )
    }

    if (isSearchTask) {
        return (
            <div
                {...attributes} {...listeners}
                ref={setNodeRef} style={style}
                className={`bg-mainBackgroundColor p-2 h-12 rounded-lg border border-accentColor cursor-pointer relative ${isDragging ? 'opacity-50' : ''}`}
            >
                <p className="text-textPrimary text-sm leading-snug truncate">
                    {task.content}
                </p>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} style={style}
            {...attributes}
            {...listeners}
            onMouseEnter={() => setMouseIsOver(true)}
            onMouseLeave={() => setMouseIsOver(false)}
            className={`${isDragging ? 'opacity-30' : ''} 
                bg-mainBackgroundColor p-2 h-10 min-h-[2.5rem] rounded-lg border border-accentColor 
                flex items-center justify-between gap-2 text-left cursor-default group`}>
            <div className="flex-1 text-sm truncate">
                {task.content}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
                {showBookmark && (
                    <button onClick={() => {
                        setBookmarked((prev) => !prev);
                        if (moveTaskToStaging) moveTaskToStaging(task.id);
                    }}
                        className="text-textSecondary hover:text-textPrimary opacity-60 hover:opacity-100 transition-opacity">
                        {bookmarked ? <BookmarkIcon sx={{ fontSize: 14 }} /> : <BookmarkBorderIcon sx={{ fontSize: 14 }} />}
                    </button>
                )}
                {mouseIsOver && !showBookmark && (
                    <button onClick={() => setEditMode(true)}
                        className="text-textSecondary hover:text-textPrimary opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity">
                        <EditIcon sx={{ fontSize: 14 }} />
                    </button>
                )}
                <button onClick={() => deleteTask(task.id)}
                    className="text-textSecondary hover:text-rose-500 opacity-60 hover:opacity-100 text-xs px-1">
                    ×
                </button>
            </div>
        </div>
    )
}

export default TaskCard;