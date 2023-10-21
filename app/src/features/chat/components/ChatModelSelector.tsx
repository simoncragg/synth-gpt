import React, { useEffect, useState } from "react";
import { IconType } from "react-icons";
import { HiLightningBolt} from "react-icons/hi";
import { HiSparkles } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";

import { setChatModel } from "../chatSlice";
import { RootStateType } from "../../../store";

interface ChatModelOption {
    model: ChatModelType;
    displayName: string;
    icon: IconType;
    iconColor: string;
    isSelected: boolean;
}

const ChatModelSelector = () => {
    const dispatch = useDispatch();
    const model = useSelector((state: RootStateType) => state.chat.model);

    useEffect(() => {
        updateOptions(model);
    }, [model]);

    const [options, setOptions] = useState<ChatModelOption[]>([
        {
            model: "gpt-3.5-turbo",
            displayName: "GPT-3.5",
            icon: HiLightningBolt,
            iconColor: "text-green-500",
            isSelected: true,
        },
        {
            model: "gpt-4",
            displayName: "GPT-4",
            icon: HiSparkles,
            iconColor: "text-purple-500",
            isSelected: false,
        },
    ]);

    const selectModel = (model: ChatModelType) => {
        dispatch(setChatModel({ model }));
        updateOptions(model);
    };

    const updateOptions = (selectedModel: ChatModelType) => {
        setOptions(prev => prev.map(option => (
            {...option, isSelected: option.model === selectedModel}
        )));
    };

    return (
        <div className="w-full flex flex-col mb-11">
            <div className="relative flex flex-col items-stretch justify-center gap-2 sm:items-center">
                <div className="relative flex rounded-xl bg-gray-900 p-1 text-gray-900">
                    <ul className="flex w-full list-none gap-1 sm:w-auto">
                        {options.map(option => (
                            <li key={option.displayName} className="group/toggle w-full">
                                <button type="button" className="w-full cursor-pointer" onClick={() => selectModel(option.model)}>
                                    <div 
                                        data-testid={option.displayName}
                                        className={
                                            `group/button relative flex w-full items-center justify-center gap-1 rounded-lg border py-3 outline-none sm:w-auto sm:min-w-[148px] md:gap-2 md:py-2.5 
                                            ${option.isSelected
                                                ? "border-zinc-600 bg-gray-700 text-gray-100 shadow-[0_1px_7px_0px_rgba(0,0,0,0.06)] hover:!opacity-100" 
                                                : "border-transparent text-gray-500 hover:text-gray-100"}`
                                    }>
                                        {React.createElement(option.icon, { className: `w-4 h-4 ${option.isSelected ? option.iconColor : ""}` })}
                                        <span className="truncate text-sm font-medium mr-1.5">{ option.displayName }</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                   </ul>
                </div>
            </div>
        </div>
    );
};

export default ChatModelSelector;
