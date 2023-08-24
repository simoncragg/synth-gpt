import { MdClose } from "react-icons/md";

interface AttachedFileProps {
	attachment: FileAttachment;
	onDelete: (attachmentId: string) => void;
	canDelete: boolean;
}

const AttachedFile = ({
	attachment: { id, file }, 
	onDelete, 
	canDelete,
}: AttachedFileProps) => {
	return (
		<div className="relative flex flex-row w-44" aria-label={file.name} title={file.name}>
			<div className="flex-shrink-0 w-12 h-12 bg-purple-800 rounded-tl-md rounded-bl-md grid place-items-center text-white text-sm uppercase truncate">
				{file.extension}
			</div>
			<div className="flex flex-start flex-col w-32 py-1.5 px-3 bg-gray-200 rounded-tr-md rounded-br-md">
				<p className="text-gray-900 text-sm truncate">{ file.name }</p>
				<div className="text-gray-500 text-xs">{ (file.size / 1000).toFixed(2) } KB</div>
			</div>
			{canDelete && (
				<button 
					type="button"
					aria-label="Delete"
					className="absolute top-0 right-0 bg-white drop-shadow-md p-1 rounded-full cursor-pointer hover:bg-stone-100 translate-x-2 -translate-y-2 z-10"
					onClick={() => onDelete(id)}>
					<MdClose className="text-gray-900 text-xs" />
				</button>
			)}
		</div>
	);
};

export default AttachedFile;
