const SVGImage = ({ src, width, height }) => {
 return (
   <div
     style={{
       width: width,
       height: height, 
       backgroundImage: `url(${src})`,
       backgroundSize: 'contain',
       backgroundRepeat: 'no-repeat',
       backgroundPosition: 'center',
     }}
   />
 );
};

export default SVGImage;