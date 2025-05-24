export default function WeNeedYouImg({ sizeCSS = '10rem' }: { sizeCSS?: string }) {
  // Este compoente es una imagen tipo avatar que se usa en la invitación
  // Sobre la imagen hay un texto que dice "We need you"
  // La imagene está servida en "/public/img/alfonso-we-need-you.PNG"
  // SizeCSS es una prop que se le pasa al componente y se usa para darle tamaño a la imagen con Tailwind
  return (
    <div className={`relative ${sizeCSS}`}>
      <img
        src="/img/alfonso-we-need-you.PNG"
        alt="We need you"
        className={`absolute inset-0 w-full h-full object-cover rounded-full`}
      />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-center pb-2">
        <span className="text-white text-lg font-bold px-2 mb-[-0.5rem] bg-black/60 rounded-b-full">
          We need you!
        </span>
      </div>
    </div>
  );
}
