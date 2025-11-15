import axios from "axios";
const BASE_URL="http://localhost:4000/api/playlist";
export const searchSongs=async(query)=>
{
    try{
        const response=await axios.get(`${BASE_URL}/search`,{
            params:{q:query},
        })
        return response.data;
    }catch(err)
    {
        console.log("Error searching songs",err.response?.data||err.message);
        return {songs:[]};
    }
}