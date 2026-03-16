import { Layout } from "@/components/layout";
import { useArticles } from "@/hooks/use-articles";
import { Loader2, BookOpen, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthLibrary() {
  const { data: articles, isLoading } = useArticles();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Health Library</h1>
        <p className="text-muted-foreground mt-1">Expert articles and wellness resources</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles?.map((article, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={article.id}
              className="bg-card border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
            >
              <div className="h-48 bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-accent opacity-80 group-hover:scale-105 transition-transform duration-500"></div>
                <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 text-white/50" />
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
                  <span className="text-sm font-semibold text-primary flex items-center group-hover:underline">
                    Read <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
