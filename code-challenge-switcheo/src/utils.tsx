import { useEffect, useState } from "react";

interface CurrencyIconProps {
  currency: string;
}

export const CurrencyIcon: React.FC<CurrencyIconProps> = ({ currency }) => {
  // Using React state to track the icon source
  const [iconSrc, setIconSrc] = useState<string>("");

  useEffect(() => {
    const fetchIcon = async () => {
      try {
        // Dynamically import the SVG based on currency name
        const iconModule = await import(`./assets/${currency}.svg`);
        setIconSrc(iconModule.default); // `default` contains the path of the SVG file
      } catch (error) {
        console.error(`Icon for ${currency} not found`, error);
        setIconSrc(""); // Fallback if the icon is not found
      }
    };

    if (currency) {
      fetchIcon();
    }
  }, [currency]);

  return (
    <div className="w-6 h-6 rounded-full flex items-center justify-center">
      {iconSrc ? (
        <img
          src={iconSrc}
          alt={`${currency} icon`}
          className="w-full h-full object-cover"
        />
      ) : (
        // replace above code with grey background circle
        <div className="w-full h-full rounded-full bg-gray-300 flex items-center justify-center" />
      )}
    </div>
  );
};
