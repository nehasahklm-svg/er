const articles = [
  {
    title: "Nepalis vote in key post-uprising elections",
    image: "https://www.manilatimes.net/manilatimes/uploads/images/2026/03/05/961289.jpg",
    source: "The Manila Times",
    url: "https://www.manilatimes.net/2026/03/06/world/asia-oceania/nepalis-vote-in-key-post-uprising-elections/2293831",
    time: "12h ago",
    tag: "election",
    excerpt: "Nepalis voted on Thursday for a new parliament in a high-stakes showdown between an entrenched old guard and a powerful youth movement.",
  },
  {
    title: "Can Gen Z Reshape Nepal's Politics?",
    image: "https://thecsrjournal.in/wp-content/uploads/2026/03/976c8c10-1836-11f1-b8cd-0f105579298f.webp",
    source: "The CSR Journal",
    url: "https://thecsrjournal.in/can-gen-z-reshape-nepal-politics/",
    time: "12h ago",
    tag: "election",
    excerpt: "After the September uprising, Nepal votes. What started as a protest against the corrupt government turned into a movement.",
  },
  {
    title: "Voting concludes: EC says nearly 60% voter turnout",
    image: "https://thehimalayantimes.com/thehimalayantimes/uploads/images/2026/03/05/46419.jpg",
    source: "The Himalayan Times",
    url: "https://thehimalayantimes.com/nepal/voting-concludes-ec-says-nearly-60-percent-voter-turnout",
    time: "12h ago",
    tag: "election",
    excerpt: "The Election Commission has estimated a 60 percent voter turnout in the House of Representatives election held today.",
  },
  {
    title: "Nepal decides",
    image: "https://img.taipeitimes.com/images/2026/03/06/P05-260306-318.jpg",
    source: "Taipei Times",
    url: "https://www.taipeitimes.com/News/world/archives/2026/03/06/2003853372",
    time: "12h ago",
    tag: "election",
    excerpt: "Bringing Taiwan to the World and the World to Taiwan.",
  },
  {
    title: "Ballot boxes from remote areas being collected by helicopters",
    image: "https://risingnepaldaily.com/storage/media/97667/nepali-sena-heli.jpg",
    source: "The Rising Nepal",
    url: "https://risingnepaldaily.com/news/76602",
    time: "12h ago",
    tag: "election",
    excerpt: "The Nepali Army has stated that the election to the House of Representatives was concluded successfully.",
  },
];

const LatestUpdates = () => {
  return (
    <section id="updates" className="scroll-mt-24">
      <div className="section-header">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 sm:gap-2 border-b border-border pb-2 sm:pb-4">
          <h2 className="section-title">Latest Updates</h2>
          <span className="label-xs text-xs">Verified election news</span>
        </div>
      </div>

      <div className="card-base rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg font-bold text-foreground mb-1">Latest Updates</h3>
        <p className="text-sm text-muted-foreground mb-6">Real-time election news from verified sources</p>

        <div className="space-y-4">
          {articles.map((article) => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 p-3 sm:p-4 rounded-xl hover:bg-secondary transition-colors group"
            >
              <img
                src={article.image}
                alt={article.title}
                className="w-20 h-20 sm:w-28 sm:h-20 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-navy bg-navy/10 px-2 py-0.5 rounded-full">{article.tag}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground">{article.time}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-navy transition-colors line-clamp-2 mb-1">{article.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 hidden sm:block">{article.excerpt}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{article.source}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 px-1 leading-relaxed">
        News Sources: All articles are sourced from verified, reputable news outlets and official election commission reports. bavsbalen.me is not responsible for the accuracy of source materials.
      </p>
    </section>
  );
};

export default LatestUpdates;
