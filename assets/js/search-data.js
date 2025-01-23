// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-projects",
          title: "Projects",
          description: "A Collection of Projects I have worked on!",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "Repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-paper-summaries",
          title: "Paper Summaries",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/summaries/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "My Resume as of 1/23/2025.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-you-need-to-pay-better-attention-paper-discussion",
      
        title: '“You Need To Pay Better Attention” Paper Discussion <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.open("https://nmesac1019.medium.com/you-need-to-pay-better-attention-paper-discussion-49fb694f6881?source=rss-98801b91b38b------2", "_blank");
        
      },
    },{id: "post-deepfakes-effective-solutions-for-rapidly-emerging-issues",
      
        title: 'Deepfakes: Effective Solutions for Rapidly Emerging Issues <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.open("https://medium.com/analytics-vidhya/deepfakes-effective-solutions-for-rapidly-emerging-issues-8b1685feef56?source=rss-98801b91b38b------2", "_blank");
        
      },
    },{id: "post-esports-niche-pastime-to-fully-fledged-business-venture",
      
        title: 'Esports: Niche Pastime to Fully Fledged Business Venture <svg width="1.2rem" height="1.2rem" top=".5rem" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 13.5v6H5v-12h6m3-3h6v6m0-6-9 9" class="icon_svg-stroke" stroke="#999" stroke-width="1.5" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.open("https://nmesac1019.medium.com/esports-niche-pastime-to-fully-fledged-business-venture-25d4af40d4e3?source=rss-98801b91b38b------2", "_blank");
        
      },
    },{id: "news-a-simple-inline-announcement",
          title: 'A simple inline announcement.',
          description: "",
          section: "News",},{id: "news-a-long-announcement-with-details",
          title: 'A long announcement with details',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-a-simple-inline-announcement-with-markdown-emoji-sparkles-smile",
          title: 'A simple inline announcement with Markdown emoji! :sparkles: :smile:',
          description: "",
          section: "News",},{id: "projects-finetuning-fromage-with-pokemon",
          title: 'Finetuning FROMAGE with Pokemon',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_scizor_finetuning/";
            },},{id: "projects-you-need-to-pay-better-attention",
          title: 'You Need to Pay Better Attention',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_pay_better_attention/";
            },},{id: "summaries-grounding-language-models-to-images-for-multimodal-inputs-and-outputs",
          title: 'Grounding Language Models to Images for Multimodal Inputs and Outputs',
          description: "",
          section: "Summaries",handler: () => {
              window.location.href = "/summaries/2024-06-13-grounding-language-models-to-images-for-multimodal-io/";
            },},{id: "summaries-you-need-to-pay-better-attention-rethinking-the-mathematics-of-attention-mechanism",
          title: 'You Need to Pay Better Attention: Rethinking the Mathematics of Attention Mechanism',
          description: "",
          section: "Summaries",handler: () => {
              window.location.href = "/summaries/2024-07-18-you-need-to-pay-better-attention/";
            },},{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
