import { useState } from "react";
import { Layout } from "@/components/layout";
import { useArticles, Article } from "@/hooks/use-articles";
import { Loader2, BookOpen, Clock, ArrowRight, X, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";

const CATEGORY_IMAGES: Record<string, string> = {
  "Heart Health": "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  "Preventive Care": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  "Mental Health": "https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=800&q=80",
  "Nutrition": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Wellness": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  "default": "https://images.unsplash.com/photo-1576671081837-49000212a370?w=800&q=80",
};

function getArticleImage(article: Article) {
  return CATEGORY_IMAGES[article.category] || CATEGORY_IMAGES["default"];
}

export default function HealthLibrary() {
  const { data: articles, isLoading } = useArticles();
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(articles?.map((a) => a.category) || []))];
  const filtered = articles?.filter(
    (a) => filterCategory === "All" || a.category === filterCategory
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Health Library</h1>
        <p className="text-muted-foreground mt-1">Expert articles and wellness resources</p>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filterCategory === cat
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map((article, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
            >
              <div className="h-48 overflow-hidden relative">
                <img
                  src={getArticleImage(article)}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {article.category}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-display font-bold text-xl text-foreground group-hover:text-primary transition-colors leading-tight mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                  {article.summary}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center text-xs font-medium text-muted-foreground gap-1.5">
                    <Clock className="w-4 h-4" />
                    {article.readTime}
                  </div>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:underline">
                    Read <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Article Read Modal */}
      <Dialog.Root open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <AnimatePresence>
          {selectedArticle && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
              <Dialog.Content
                asChild
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-background rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                >
                  {/* Header Image */}
                  <div className="relative h-52 shrink-0">
                    <img
                      src={getArticleImage(selectedArticle)}
                      alt={selectedArticle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Dialog.Close className="absolute top-3 right-3 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 transition-colors">
                      <X className="w-4 h-4" />
                    </Dialog.Close>
                    <div className="absolute bottom-4 left-6">
                      <span className="bg-white/90 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedArticle.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Content */}
                  <div className="overflow-y-auto flex-1 p-6">
                    <button
                      onClick={() => setSelectedArticle(null)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back to Library
                    </button>

                    <Dialog.Title className="text-2xl font-display font-bold text-foreground mb-2 leading-snug">
                      {selectedArticle.title}
                    </Dialog.Title>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedArticle.readTime}
                      <span>·</span>
                      <BookOpen className="w-3.5 h-3.5" />
                      Don Juan Medical Center Health Library
                    </div>

                    <p className="text-sm text-foreground/70 italic border-l-4 border-primary/30 pl-4 mb-6 leading-relaxed">
                      {selectedArticle.summary}
                    </p>

                    <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
                      {selectedArticle.content
                        .split("\n\n")
                        .map((paragraph, i) => {
                          const isBold = paragraph.startsWith("**") && paragraph.endsWith("**");
                          if (isBold) {
                            return (
                              <h3 key={i} className="font-display font-bold text-foreground text-base mt-5">
                                {paragraph.replace(/\*\*/g, "")}
                              </h3>
                            );
                          }
                          const parsed = paragraph.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
                          return (
                            <p key={i} dangerouslySetInnerHTML={{ __html: parsed }} />
                          );
                        })}
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    </Layout>
  );
}
