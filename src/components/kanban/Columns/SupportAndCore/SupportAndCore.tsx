import React from 'react';
import { SortableContext } from "@dnd-kit/sortable";
import VerticalBoard from "../../VerticalBoardContainer";
import { Board, Task } from '../../../../types';
import PlusIcon from '../../../../icons/PlusIcon';
import Support from './Support';
import Core from './Core';

interface SupportAndCoreProps {
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

const SupportAndCore: React.FC<SupportAndCoreProps> = ({
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
        <div className={`flex flex-col gap-2 h-full  bg-mainBackgroundColor rounded-lg p-2 transition-all duration-500 ease-in-out ${isStagingCollapsed ? 'w-2/3' : 'w-1/2'}`}>
            <Support
                columns={columns}
                createNewBoard={createNewBoard}
                deleteBoard={deleteBoard}
                updateBoard={updateBoard}
                createTask={createTask}
                tasks={tasks}
                deleteTask={deleteTask}
                updateTask={updateTask}
            />
            <Core
                columns={columns}
                createNewBoard={createNewBoard}
                deleteBoard={deleteBoard}
                updateBoard={updateBoard}
                createTask={createTask}
                tasks={tasks}
                deleteTask={deleteTask}
                updateTask={updateTask}
            />
        </div>
    );
};

export default SupportAndCore;