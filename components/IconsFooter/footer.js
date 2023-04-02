
import { Box } from '@material-ui/core';

function footer() {
    return (
        <Box className='socialIcon' style={{position: "absolute", right: 0, bottom: 0, alignItems:"center"}}>
            <a href="https://twitter.com/Glacier_Fi"  target="_blank" style={{background:"none"}}><img src="../socials/socialcion1.svg" alt="Icon" /></a>
            <a href="https://discord.com/invite/glacierdex"  target="_blank" style={{background:"none"}}><img src="../socials/social-cion2.svg" alt="Icon" /></a>
            <a href="https://docs.glacier.exchange/"  target="_blank" style={{background:"none", width:"30px", height:"30px"}}><img src="../socials/social-cion3.png" alt="Icon" /></a>
            <a href="https://www.youtube.com/channel/UCs4njSZMKh6JQgJ2U2g5dNQ"  target="_blank" style={{background:"none"}}><img src="../socials/youtube.svg" alt="Icon" /></a>
        </Box>
    )
}
export default footer