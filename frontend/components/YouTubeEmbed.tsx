type YoutubeEmbedProps = {
  videoId: string;
};

const YoutubeEmbed = ({ videoId }: YoutubeEmbedProps) => {
  return (
    <div className='video-responsive'>
      <iframe
        width='560'
        height='315'
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&iv_load_policy=3`}
        title='YouTube video player'></iframe>
    </div>
  );
};

export default YoutubeEmbed;
