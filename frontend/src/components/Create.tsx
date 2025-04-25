import { BsFillPeopleFill } from "react-icons/bs";
import { ButtonProps } from "@/types/ButtonProps";

const Create = ({ label }: ButtonProps) => {
  const createRoom = () => {
    fetch(`${process.env.NEXT_PUBLIC_HTTP_URL}/rooms/create`, {
      method: "POST",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to create room");
        }
        return response.json();
      })
      .then((data) => {
        if (data.room_id) {
          // Redirect to the room page
          window.location.href = `/room/${data.room_id}`;
        } else {
          throw new Error("Room code not found in response");
        }
      })
      .catch((error) => {
        console.error(error);
        // Handle error (e.g., show an error message)
        alert("Failed to create room. Please try again.");
      });
  };

  return (
    <button
      onClick={createRoom}
      className='flex cursor-pointer font-liberation font-bold space-x-2 items-center justify-center rounded-md px-4 py-2 bg-accent hover:bg-white hover:text-accent'>
      <BsFillPeopleFill size={50} />
      {label}
    </button>
  );
};

export default Create;
