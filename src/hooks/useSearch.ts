import { taskList } from "../data/tasks";

const useSearch = (createBulkTasks, searchBoardId) => {
    
    const search = (searchKey: string) => {
        let resultTasks = taskList.filter(task =>
            task.toLowerCase().includes(searchKey.toLowerCase())
        );
        
        createBulkTasks(searchBoardId, resultTasks);
    };
    return { search };
};

export default useSearch;