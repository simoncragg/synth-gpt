interface AttachedFileProps {
	attachment: FileAttachment;
}

const AttachedFile = ({	attachment: { file }, }: AttachedFileProps) => {
	return (
		<div className="relative flex flex-row w-44" aria-label={file.name} title={file.name}>
			<div className="flex-shrink-0 w-12 h-12 bg-purple-800 rounded-tl-md rounded-bl-md grid place-items-center text-white text-sm uppercase truncate">
				{file.extension}
			</div>
			<div className="flex flex-start flex-col w-32 py-1.5 px-3 bg-gray-200 rounded-tr-md rounded-br-md">
				<p className="text-gray-900 text-sm truncate">{ file.name }</p>
				<div className="text-gray-500 text-xs">{ (file.size / 1000).toFixed(2) } KB</div>
			</div>
		</div>
	);
};

export default AttachedFile;
