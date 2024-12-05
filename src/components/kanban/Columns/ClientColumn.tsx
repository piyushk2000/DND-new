
import React from 'react';
import { SortableContext } from "@dnd-kit/sortable";
import VerticalBoard from "../VerticalBoardContainer";
import { Board, Task } from '../../../types';
import PlusIcon from '../../../icons/PlusIcon';

interface ClientColumnProps {
    columns: { [key: string]: Board[] | { [row: string]: Board[] } };
    createNewBoard: (column: string) => void;
    deleteBoard: (boardId: string) => void;
    updateBoard: (boardId: string, title: string) => void;
    createTask: (boardId: string, content: string, index?: number) => void;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    updateTask: (taskId: string, content: string) => void;
    isStagingCollapsed: boolean;
}

const ClientColumn: React.FC<ClientColumnProps> = ({
    columns,
    createNewBoard,
    deleteBoard,
    updateBoard,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    isStagingCollapsed
}) => {
    return (
        <div className={`flex flex-col gap-4 h-full overflow-auto bg-columnBackgroundColor rounded-lg p-2 transition-all duration-500 ease-in-out ${isStagingCollapsed ? 'w-1/3' : 'w-1/4'}`}>
            {/* Area Header */}
            <div className="area-header flex items-center justify-between mb-2 sticky top-0 bg-mainBackgroundColor p-2 rounded-md shadow">
                <h2 className="text-lg font-semibold text-textPrimary">Client</h2>
                <button
                    onClick={() => createNewBoard('Client')}
                    className="p-1 rounded-full hover:bg-accentColor hover:text-mainBackgroundColor">
                    <PlusIcon />
                </button>
            </div>
            <div className="overflow-auto h-full">
                <SortableContext items={(columns['Client'] as Board[]).map(board => board.id)}>
                    {(columns['Client'] as Board[]).map(board => (
                        <VerticalBoard
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
        </div>
    );
};

export default ClientColumn;