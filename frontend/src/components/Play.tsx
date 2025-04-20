import Link from "next/link";
import { BsFillPlayFill } from "react-icons/bs";
import { ButtonProps } from "@/types/ButtonProps";

/**
 * A rectangular play button that navigates to /play on click.
 */
const Play = ({ link, label }: ButtonProps) => {
  return (
    <Link
      href={link}
      className='font-liberation flex items-center jusitfy-center rounded-md px-4 py-2 bg-accent hover:bg-white hover:text-accent font-bold space-x-2'>
      <BsFillPlayFill size={50} />
      {label}
    </Link>
  );
};

export default Play;
