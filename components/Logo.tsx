import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  const imageUrl = "https://media-gru2-1.cdn.whatsapp.net/v/t61.24694-24/524985633_3240374882786562_4615594474647160550_n.jpg?ccb=11-4&oh=01_Q5Aa2wHbWo4-FkoYNWXxyGHFMFUABZ9VETSFztBTcY5jV6g9Ug&oe=691519F1&_nc_sid=5e03e0&_nc_cat=105";
  
  // Find the height class from the passed className string.
  // The parent components pass things like "h-20 text-emerald-700".
  // We only care about the h- class for sizing the image. The text color is now part of this component.
  const sizeClass = className.split(' ').find(c => c.startsWith('h-')) || 'h-16';

  return (
    // The parent components have containers that manage spacing around the logo.
    <div className="flex flex-col items-center text-center">
      <img 
        src={imageUrl} 
        alt="Logo Camila Sorroche" 
        className={`${sizeClass} w-auto aspect-square rounded-full object-cover mb-3 shadow-md`}
      />
       <div className="text-emerald-800">
            <p className="text-xl font-bold leading-tight">Camila Sorroche</p>
            <p className="text-sm font-medium text-emerald-600">Nutricionista</p>
       </div>
    </div>
  );
};

export default Logo;
