import { Dispatch, SetStateAction } from "react";

interface SubquestInputFormat {
	descriptionState: [string[], Dispatch<SetStateAction<string[]>>],
	promptState: [string[], Dispatch<SetStateAction<string[]>>],
}


export default function SubquestInput({descriptionState, promptState}: SubquestInputFormat) {
	const [description, setDescription] = descriptionState;
	const [prompt, setPrompt] = promptState;

}