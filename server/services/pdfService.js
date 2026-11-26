import { extractText, getDocumentProxy} from "unpdf";
export const extractPages=async(buffer)=>{
    const pdf= await getDocumentProxy(new Uint8Array(buffer));
    const {totalPages, text}=await extractText(pdf,{mergePages:false});
    return {totalPages,pages:text};
};