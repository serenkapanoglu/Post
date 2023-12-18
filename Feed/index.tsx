import Post from "~/components/Post";
import { ImageCircleIcon, PlayCircleIcon } from "~/util/icons";
import { useAsync } from "react-async-hook";
import { chain } from "lodash";
import { useAon } from "~/sdk";
import { Avatar, Box, Link } from "~/ui";
import SuggestedUsers from "../SuggestedUsers";
import { useState } from 'react';
import { CreatePostModal } from "../../modals/CreatePostModal";
import { aon } from "~/sdk";
import { useLocation } from 'react-router-dom';
import defaultImg from '/crowns/gold.png';

export default function Feed(props: {
  fetcher: () => Promise<PostData[]>;
  disableInput?: boolean;
  disableTabs?: boolean;
}) {
  const { fetcher, disableTabs, disableInput } = props;
  const user = useAon((x) => x.session?.user);

  const imageProfURL = `${user?.profimage}`;

  const { result: posts } = useAsync(fetcher, [], {
    executeOnUpdate: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const location = useLocation();
  const isStreamPage = location.pathname === '/';
  const isRankPage = location.pathname === '/rank';

  return (
    <Box className="flex flex-col gap-[60px]">
      {/* Top bar */}
      {!disableInput && (
        <Box className="flex flex-row gap-[20px] items-center">
          {/* Avatar */}
          <Box>
            <Avatar src={imageProfURL ? `http://localhost:8000/api${imageProfURL}` : defaultImg} size={64} />
          </Box>
          {/* Create Post Field */}
          <Box 
          className="bg-[var(--bg-input)] h-[56px] cursor-pointer rounded-2xl flex-1 flex flex-row"
          onClick={openModal}
          >
            <div className="flex-1 flex flex-row">
              <div className="flex-1 bg-transparent px-[24px] outline-0 border-0 text-[var(--color-text)] text-lg w-full" />
            </div>
            <div className="m-[24px] flex flex-row items-center gap-[24px]">
              <ImageCircleIcon className="opacity-20 w-[32px] h-[32px] hover:opacity-80 cursor-pointer transition-opacity" />
              <PlayCircleIcon className="opacity-20 w-[32px] h-[32px] hover:opacity-80 cursor-pointer transition-opacity" />
            </div>
          </Box>
          {isModalOpen && (
            <CreatePostModal onClose={closeModal} />
          )}
          {/* Tabs */}
          {!disableTabs && (
            <Box className="flex flex-row gap-24px <md:hidden">
              <Link 
              to={`/`}
              className={`text-[24px] uppercase ${isStreamPage ? 'opacity-100' : 'opacity-60'} cursor-pointer hover:opacity-100`}>
                Stream
              </Link>
              <Link 
              to={`/rank`}
              className={`text-[24px] uppercase ${isRankPage ? 'opacity-100' : 'opacity-60'} cursor-pointer transition-opacity hover:opacity-100`}>
                Rank
              </Link>
            </Box>
          )}
        </Box>
      )}

      {/* Posts */}
      <Box className="flex flex-col gap-[20px]">
        {[
          /* Posts */
          chain(posts || [])
            .map((data, i) => <Post data={data} index={`${i}`} user={user} key={`post-${i}`} />)
            /* add a suggested user section after every 4 posts */
            .chunk(4)
            .flatMap((chunk, i) => [
              ...chunk,
              <SuggestedUsers 
              key={`suggest-${i}`}
              fetcher={aon.getUsers}
               />,
            ])
            /* Removes last suggested users section */
            .slice(0, -1)
            /* Adds dividers after every section */
            .flatMap((x, i) => [
              x,
              <div
                key={`divider-${i}`}
                className="h-[1px] w-full bg-[var(--color-divider)]"
              />,
            ])
            /* Removes last divider since it's not in between sections */
            .slice(0, -1)
            .value(),
        ]}
      </Box>
    </Box>
  );
}
