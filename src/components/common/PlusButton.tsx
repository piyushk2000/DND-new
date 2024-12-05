
import PlusIcon from '../../icons/PlusIcon';

const PlusButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="p-1 rounded-full hover:bg-accentColor hover:text-mainBackgroundColor"
    >
      <PlusIcon />
    </button>
  );
};

export default PlusButton;