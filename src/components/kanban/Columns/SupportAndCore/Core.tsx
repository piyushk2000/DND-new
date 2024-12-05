
import React from 'react';
import { SortableContext } from "@dnd-kit/sortable";
import VerticalBoard from "../../VerticalBoardContainer";
import { Board, Task } from '../../../../types';
import PlusIcon from '../../../../icons/PlusIcon';

interface CoreProps {
    columns: { [key: string]: Board[] | { [row: string]: Board[] } };
    createNewBoard: (column: string) => void;
    deleteBoard: (boardId: string) => void;
    updateBoard: (boardId: string, title: string) => void;
    createTask: (boardId: string, content: string, index?: number) => void;
    tasks: Task[];
    deleteTask: (taskId: string) => void;
    updateTask: (taskId: string, content: string) => void;
}

const Core: React.FC<CoreProps> = ({
    columns,
    createNewBoard,
    deleteBoard,
    updateBoard,
    createTask,
    tasks,
    deleteTask,
    updateTask
}) => {
    return (
        <div className="flex flex-col gap-2 h-[32%] bg-columnBackgroundColor rounded-lg p-2">
            <div className="area-header flex items-center justify-between mb-0.5 sticky top-0 bg-mainBackgroundColor p-2 rounded-md shadow">
                <h2 className="text-lg font-semibold text-textPrimary">Core</h2>
                <button
                    onClick={() => createNewBoard('Core')}
                    className="p-1 rounded-full hover:bg-accentColor hover:text-mainBackgroundColor">
                    <PlusIcon />
                </button>
            </div>
            <div className="overflow-auto h-full">
                <div className="grid grid-cols-3 gap-2">
                    <SortableContext items={(columns['Core'] as Board[]).map(board => board.id)}>
                        {(columns['Core'] as Board[]).map(board => (
                            <VerticalBoard
                                key={board.id}
                                board={board}
                                deleteBoard={deleteBoard}
                                updateBoard={updateBoard}
                                createTask={createTask}
                                tasks={tasks.filter(task => task.boardId === board.id)}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                                columnsPerRow={3}
                                BigColumn
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
        </div>
    );
};

export default Core;