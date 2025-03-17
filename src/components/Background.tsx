import { Image, Layer } from "react-konva";

interface BackgroundProps {
  backgroundImage: HTMLImageElement | null;
}

export const Background: React.FC<BackgroundProps> = ({ backgroundImage }) => {
  return (
    <Layer>
      {backgroundImage && (
        <Image
          image={backgroundImage}
          width={window.innerWidth}
          height={window.innerHeight - 48}
          listening={false}
        />
      )}
    </Layer>
  );
};
