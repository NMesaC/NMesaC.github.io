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
  },{id: "nav-blog",
          title: "Blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "A collection of projects I have worked on.",
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
        },{id: "nav-cv",
          title: "CV",
          description: "My Resume as of 8/1/2025.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-how-are-cross-attention-and-cross-modal-projection-layers-related-in-vision-language-models",
      
        title: "How are Cross Attention and Cross Modal Projection Layers Related in Vision-Language Models?...",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2025/crossattn-llava-comparison/";
        
      },
    },{id: "post-you-need-to-pay-better-attention-rethinking-the-mathematics-of-attention-mechanism",
      
        title: "You Need to Pay Better Attention: Rethinking the Mathematics of Attention Mechanism",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/you-need-to-pay-better-attention/";
        
      },
    },{id: "post-grounding-language-models-to-images-for-multimodal-inputs-and-outputs-fromage",
      
        title: "Grounding Language Models to Images for Multimodal Inputs and Outputs (FROMAGE)",
      
      description: "",
      section: "Posts",
      handler: () => {
        
          window.location.href = "/blog/2024/grounding-language-models-to-images-for-multimodal-io/";
        
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
          section: "News",},{id: "projects-quot-you-need-to-pay-better-attention-quot-paper-discussion",
          title: '&amp;quot;You Need to Pay Better Attention&amp;quot; Paper Discussion',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_pay_better_attention/";
            },},{id: "projects-finetuning-fromage-with-pokemon",
          title: 'Finetuning FROMAGE with Pokemon',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_scizor_finetuning/";
            },},{id: "projects-multimodal-model-for-meme-caption-generation",
          title: 'Multimodal Model for Meme Caption Generation',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_memecaption_multimodal_model/";
            },},{id: "projects-h2o-kv-cache-for-llava",
          title: 'H2O KV-Cache for LLaVA',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_h2okvcache_for_llava/";
            },},{id: "projects-a-quantized-h2o-kv-cache",
          title: 'A Quantized H2O KV Cache',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_quantized_h2okvcache/";
            },},{id: "projects-gaussian-process-regression-for-predicting-blueberry-prices",
          title: 'Gaussian Process Regression for Predicting Blueberry Prices',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_gaussian_process_berry_prediction/";
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
