

const PNGImage = ({ src, height, width }) => {
 return (
   <div
     style={{
       height: height,
       width: width,
       backgroundImage: `url(${src})`,
       backgroundSize: 'contain',
       backgroundRepeat: 'no-repeat',
       backgroundPosition: 'center',
     }}
   />
 );
};

export default PNGImage;