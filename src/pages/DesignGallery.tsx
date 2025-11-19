import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Grid3x3, List, Search, Upload, FolderOpen } from "lucide-react";
import { useDesignProjects } from "@/hooks/useDesignProjects";
import { DesignProjectCard } from "@/components/DesignProjectCard";
import { DesignGalleryDateFilter } from "@/components/DesignGalleryDateFilter";

export default function DesignGallery() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"created_at" | "project_name" | "cabinet_count">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dateFrom, setDateFrom] = useState<string | undefined>();
  const [dateTo, setDateTo] = useState<string | undefined>();

  const { projects, isLoading, deleteProject } = useDesignProjects({
    searchQuery,
    sortBy,
    sortDirection,
    dateFrom,
    dateTo,
  });

  const handleDateChange = (from: string | undefined, to: string | undefined) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newDirection] = value.split("-") as [typeof sortBy, typeof sortDirection];
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/estimates")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Estimates
          </Button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Design Gallery</h1>
              <p className="text-muted-foreground mt-1">
                {isLoading ? "Loading..." : `${projects.length} ${projects.length === 1 ? "project" : "projects"}`}
              </p>
            </div>
            <Button onClick={() => navigate("/design-import")}>
              <Upload className="mr-2 h-4 w-4" />
              Import Design
            </Button>
          </div>

          {/* Controls */}
          <Card className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Sort */}
                <Select
                  value={`${sortBy}-${sortDirection}`}
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest First</SelectItem>
                    <SelectItem value="created_at-asc">Oldest First</SelectItem>
                    <SelectItem value="project_name-asc">Name A-Z</SelectItem>
                    <SelectItem value="project_name-desc">Name Z-A</SelectItem>
                    <SelectItem value="cabinet_count-desc">Most Cabinets</SelectItem>
                    <SelectItem value="cabinet_count-asc">Least Cabinets</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Date Range Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Filter by date:</span>
                <DesignGalleryDateFilter onDateChange={handleDateChange} />
              </div>
            </div>
          </Card>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse bg-muted" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Design Projects Yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery
                ? `No projects found matching "${searchQuery}"`
                : "Get started by importing your first KCDW design project with cabinet lists and drawings."}
            </p>
            <Button onClick={() => navigate("/design-import")}>
              <Upload className="mr-2 h-4 w-4" />
              Import Your First Design
            </Button>
          </Card>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {projects.map((project) => (
              <DesignProjectCard
                key={project.id}
                project={project}
                onDelete={deleteProject}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
