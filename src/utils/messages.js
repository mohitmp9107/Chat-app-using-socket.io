const genereateMessage = (username,txt)=>{
    return {
        username,
        text:txt,
        createdAt: new Date().getTime()
    }
};
const genereateLocationMessage = (username,url)=>{
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
};

module.exports = {
    genereateMessage,
    genereateLocationMessage,
}