import Link from "next/link";
import { BsFillPeopleFill } from "react-icons/bs";
import { ButtonProps } from "@/types/ButtonProps";

const Create = ({ link, label }: ButtonProps) => {
  return (
    <Link
      href={link}
      className='flex font-liberation font-bold space-x-2 items-center justify-center rounded-md px-4 py-2 bg-accent hover:bg-white hover:text-accent'>
      <BsFillPeopleFill size={50} />
      {label}
    </Link>
  );
};

export default Create;
