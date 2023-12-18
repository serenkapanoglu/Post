import { DateTime } from "luxon";
import { useState, useEffect } from "react";
import { Link, Image, Avatar, Box, Text } from "~/ui";
import {
  DotsIcon,
  HeartIcon,
  HeartOutlineIcon,
  LockIcon,
  RepostIcon,
  StarIcon,
  StarOutlineIcon,
} from "~/util/icons";
import styles from "./style.module.css";
import clsx from "clsx";
import { LoadingContainer } from "~/components/LoadingContainer";
import { useLocation } from "react-router";
import _ from 'lodash';
import goldCrown from '/crowns/gold.png';
import defaultImg from '/crowns/1.png';
import silverCrown from '/crowns/2.png';
import bronzeCrown from '/crowns/3.png';
import star from '/other/star.png';
import axios from "axios";
import { CreateRepostModal } from "../../modals/CreateRepostModal";

//@ts-ignore
const s = "text-[var(---color-yellow)]";

export default function Post(props: { data: PostData, index: string, user:any }) {
  const { data, index,user } = props;

  const numericIndex = parseInt(index, 10); // Assuming base 10
  const displayIndex = !isNaN(numericIndex) ? numericIndex + 1 : 0;

  const imageURL = `http://localhost:8000/api${data.postimage}`;
  const imageProfURL = `${data.profileImage}`;

  const location = useLocation();

  const isRankedPage = location.pathname === '/rank';

  const [likeCount, setLikeCount] = useState(() => {
    const storedLikeCount = localStorage.getItem(`likeCount_${data._id}`);
    return storedLikeCount ? Number(storedLikeCount) : data.likes;
  });
  const [isLiked, setLiked] = useState(() => {
    const likedInStorage = localStorage.getItem(`isLiked_${data._id}`);
    return likedInStorage ==='true';
  });
  
  const [starCount, setStarCount] = useState(() => {
    const storedStarCount = localStorage.getItem(`starCount_${data._id}`);
    return storedStarCount ? Number(storedStarCount) : data.stars;
  });
  const [isStarred, setStarred] = useState(() => {
    const starredInStorage = localStorage.getItem(`isStarred_${data._id}`);
    return starredInStorage ==='true';
  });
  const [isReposted, setReposted] = useState(false);
  


  const [isHovered, setIsHovered] = useState(false);

  const getAvatarForIndex = (displayIndex: number) => {
    if (displayIndex === 1) {
      // Gold crown for the first post
      return <img src={defaultImg} className='w-23 px-5' />;
    } else if (displayIndex === 2) {
      // Silver crown for the second post
      return <img src={silverCrown} className='w-23 px-5' />;
    } else if (displayIndex === 3) {
      // Bronze crown for the third post
      return <img src={bronzeCrown} className='w-23 px-5' />;
    } else {
      // Default avatar for other posts
      return <img src={goldCrown } className='w-23 px-5' />;
    }
  };
  
 
  const handleLikeClick = async() => {
    try {
      let raw = JSON.stringify({
        "id":data._id,
        "user":data.user,
        "slug":data.slug,
        "likes":1,
        "likesUsers":user._id,
      });
      const result = await axios.patch(`http://localhost:8000/posts/${data._id}`, raw,{
        headers:{
          'Content-Type':'application/json',
        }
      });
      console.log(result);
     
  } catch (error) {
    console.error("Error updating like count:", error);
  }
}; 
  

			
  const handleStarClick = async() => {
   
    try {
      let raw = JSON.stringify({
        "id":data._id,
        "user":data.user,
        "slug":data.slug,
        "stars":1,
        "starDonator":user._id,
        "likes":data.likes,
        "likesUsers":data.likesUsers,
        
      });
      const result = await axios.patch(`http://localhost:8000/posts/${data._id}`, raw,{
        headers:{
          'Content-Type':'application/json',
        }
      });
      console.log(result);
     
      
    } catch (error) {
      console.error("Error updating star count:", error);
    }
  };
  




  
  useEffect(() => {
    try {
      // Update localStorage with the latest counts
      localStorage.setItem(`likeCount_${data._id}`, likeCount.toString());
      localStorage.setItem(`starCount_${data._id}`, starCount.toString());
    } catch (error) {
      console.error("Error updating counts in localStorage:", error);
    }
  }, [data._id, likeCount, starCount]);
  


  useEffect(() => {
    const fetchInitialLikeCount = async () => {
      try {
        // Fetch initial like count from localStorage
        const storedLikeCount = localStorage.getItem(`likeCount_${data._id}`);
        if (storedLikeCount !== null) {
          setLikeCount(Number(storedLikeCount));
        }
      } catch (error) {
        console.error("Error fetching initial like count:", error);
      }
    };

    fetchInitialLikeCount();
  }, [data._id]);


  useEffect(() => {
    const fetchInitialStarCount = async () => {
      try {
        // Fetch initial star count from localStorage
        const storedStarCount = localStorage.getItem(`starCount_${data._id}`);
        if (storedStarCount !== null) {
          setStarCount(Number(storedStarCount));
        }
      } catch (error) {
        console.error("Error fetching initial star count:", error);
      }
    };

    fetchInitialStarCount();
  }, [data._id]);


  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setReposted((x) => !x)
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box className={clsx("flex flex-col space-y-[34px] mt-4", styles.post)}>
      <Box className="flex flex-row items-center justify-between space-x-[20px]">
        <Link to={`/profile/${data.slug}`}>
          <Avatar src={imageProfURL ? `http://localhost:8000/api${imageProfURL}` : defaultImg} size={56} />
        </Link>
        <Box className="flex flex-row items-center justify-between space-x-20px flex-1 <md:flex-col <md:items-stretch <md:space-x-[0px]">
          <Box className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:items-center md:space-x-20px">
            <Link to={`/profile/${data.slug}`}>
              <Box className="text-[22px] text-[var(--color-accent)] cursor-pointer <md:text-[18px]">
                {data.user}
              </Box>
            </Link>
          </Box>
          <Box className="flex flex-row items-center justify-between space-x-20px flex-1">
            <Box className="text-[14px] <md:text-xs">
              {DateTime.fromISO(data.createdAt).toRelative()}
            </Box>
            <Box className="flex flex-row items-center justify-between space-x-20px">
              {!isRankedPage &&
              <Box className="flex flex-row gap-[4px] <md:text-xs">
                <Text>In</Text>
                <Link to={`/category?id=${data.category}`}>
                  {data.category}
                </Link>
              </Box>}
              {isRankedPage && (
                <div className="flex items-center">
                  <img src={star} className='w-7 h-7 gap-2' />
                  <Box className="<md:text-xs" style={{ fontSize: '35px', paddingLeft: '5px' }}>
                    {data.stars}
                  </Box>
                  {getAvatarForIndex(displayIndex)}
                  <Box className="<md:text-xs" style={{ fontSize: '35px' }}>
                    #{displayIndex}
                  </Box>
                </div>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      {data.visibility != "all" ? (
        <Box className="border-[1px] border-solid border-[var(--color-divider)] flex flex-col justify-center items-center min-h-[320px] rounded-2xl gap-[20px]">
          <Text className="text-sm">Hidden Post</Text>
          <LockIcon className="w-[160px] h-[160px] text-[var(--color-divider)]" />
        </Box>
      ) : (
        <Link
          to={`/post/${data._id}`}
          state={{ background: location.state?.background || location }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <LoadingContainer className="relative flex flex-col rounded-lg">
            <Image 
            className="w-full h-full object-cover" 
            src={imageURL}
             />
            {isHovered && data.text && (
              <Box 
              className="absolute left-0 bottom-0 right-0 p-[40px] backdrop-blur-md backdrop-filter backdrop-blur-[10px] bg-[rgba(0,0,0,0.8)] <md:text-xs <md:p-[20px] transition-opacity duration-500 opacity-0 hover:opacity-100"
              >
                {data.text}
              </Box>
            )}
        </LoadingContainer>
      </Link>
      )}
      <Box className="flex flex-row items-center justify-end space-x-20px <md:space-x-[4px]">
        {/* Like button */}
        <Box
          className="flex flex-row space-x-[8px] items-center hover:bg-[var(--color-hover)] p-[12px] rounded-2xl cursor-pointer"
          onClick={handleLikeClick}
        >
          {isLiked ? (
            <HeartIcon className="h-[24px] w-[24px] text-[var(--color-red)] <md:h-[20px] <md:w-[20px]" />
          ) : (
            <HeartOutlineIcon className="h-[24px] w-[24px] <md:h-[20px] <md:w-[20px]" />
          )}
          <Box className="text-[20px] <md:text-[16px]">{data.likes}</Box>
        </Box>


       {/* Star button */}
        <Box
          className="flex flex-row space-x-[8px] items-center hover:bg-[var(--color-hover)] p-[12px] rounded-2xl cursor-pointer"
          onClick={handleStarClick}
        >
          {isStarred ? (
            <StarIcon className="h-[24px] w-[24px] text-[var(--color-yellow)] <md:h-[20px] <md:w-[20px]" />
          ) : (
            <StarOutlineIcon className="h-[24px] w-[24px] <md:h-[20px] <md:w-[20px]" />
          )}
          <Box className="text-[20px] <md:text-[16px]">{data.stars}</Box>
        </Box>


        {/* Repost button */}
        <Box
          className="flex flex-row space-x-[8px] items-center hover:bg-[var(--color-hover)] p-[12px] rounded-2xl cursor-pointer"
          onClick={openModal}
        >
          {isReposted ? (
            <RepostIcon className="h-[24px] w-[24px] text-[var(--color-blue)] <md:h-[20px] <md:w-[20px]" />
          ) : (
            <RepostIcon className="h-[24px] w-[24px] <md:h-[20px] <md:w-[20px]" />
          )}
          <Box className="text-[20px] <md:text-[16px]">{data.shares}</Box>
        </Box>
        {isModalOpen && (
            <CreateRepostModal onClose={closeModal} remixPost={data} />
          )}

        {/* More menu */}
        <Box className="flex flex-row space-x-[12px] items-center hover:bg-[var(--color-hover)] p-[12px] rounded-2xl cursor-pointer">
          <DotsIcon className="w-[20px] h-[20px] <md:h-[16px] <md:w-[16px]" />
        </Box>
      </Box>
    </Box>
  );
}