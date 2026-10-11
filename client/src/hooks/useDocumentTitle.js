import { useEffect } from "react";

// Sets the tab title to "<title> · Pravesh Pandey" while the page is mounted, then restores it.
// (Link previews on LinkedIn/Upwork read index.html's static tags; crawlers there don't run JS.)
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = `${title} · Pravesh Pandey`;
    return () => {
      document.title = previous;
    };
  }, [title]);
};
