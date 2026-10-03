import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  BookOpen,
  UploadCloud,
  FileText,
  Eye,
  Download,
  Trash2,
  LoaderCircle,
  HardDrive,
  CalendarDays,
  FileImage,
  Presentation,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getStudyMaterials,
  uploadStudyMaterial,
  viewStudyMaterial,
  downloadStudyMaterial,
  deleteStudyMaterial,
} from "../api/studyMaterials";

function StudyMaterials() {
  const [materials, setMaterials] =
    useState([]);

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [title, setTitle] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [viewingId, setViewingId] =
    useState(null);

  const [downloadingId, setDownloadingId] =
    useState(null);

  const fileInputRef = useRef(null);

  const allowedExtensions =
    ".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp";

  // ==========================
  // FORMAT FILE SIZE
  // ==========================
  const formatFileSize = (
    bytes
  ) => {
    if (
      bytes === null ||
      bytes === undefined
    ) {
      return "Size unavailable";
    }

    if (bytes === 0) {
      return "0 KB";
    }

    const kb =
      bytes / 1024;

    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }

    const mb =
      kb / 1024;

    return `${mb.toFixed(2)} MB`;
  };

  // ==========================
  // FORMAT DATE
  // ==========================
  const formatDate = (
    date
  ) => {
    if (!date) {
      return "Unknown";
    }

    return new Date(
      date
    ).toLocaleDateString();
  };

  // ==========================
  // FILE TYPE
  // ==========================
  const getFileType = (
    fileType
  ) => {
    if (
      fileType ===
      "application/pdf"
    ) {
      return "PDF";
    }

    if (
      fileType ===
        "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return "Word";
    }

    if (
      fileType ===
        "application/vnd.ms-powerpoint" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    ) {
      return "PowerPoint";
    }

    if (
      fileType?.startsWith(
        "image/"
      )
    ) {
      return "Image";
    }

    return "File";
  };

  // ==========================
  // FILE ICON
  // ==========================
  const getFileIcon = (
    fileType
  ) => {
    if (
      fileType?.startsWith(
        "image/"
      )
    ) {
      return (
        <FileImage size={24} />
      );
    }

    if (
      fileType?.includes(
        "powerpoint"
      )
    ) {
      return (
        <Presentation size={24} />
      );
    }

    return (
      <FileText size={24} />
    );
  };

  // ==========================
  // FETCH MATERIALS
  // ==========================
  const fetchMaterials =
    async () => {
      try {
        setLoading(true);

        const response =
          await getStudyMaterials();

        setMaterials(
          response?.data || []
        );
      } catch (error) {
        console.error(
          "Get Study Materials Error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to load study materials."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // ==========================
  // SELECT FILE
  // ==========================
  const handleFileChange = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      setTitle(
        file.name.replace(
          /\.[^/.]+$/,
          ""
        )
      );
    }
  };

  // ==========================
  // UPLOAD
  // ==========================
  const handleUpload =
    async (event) => {
      event.preventDefault();

      if (!selectedFile) {
        toast.error(
          "Please select a file."
        );

        return;
      }

      if (!title.trim()) {
        toast.error(
          "Please enter a title."
        );

        return;
      }

      if (
        title.trim().length > 150
      ) {
        toast.error(
          "Title must be 150 characters or less."
        );

        return;
      }

      try {
        setUploading(true);

        const response =
          await uploadStudyMaterial(
            selectedFile,
            title.trim()
          );

        toast.success(
          response.message ||
            "Study material uploaded successfully."
        );

        setSelectedFile(null);
        setTitle("");

        if (
          fileInputRef.current
        ) {
          fileInputRef.current.value =
            "";
        }

        await fetchMaterials();
      } catch (error) {
        console.error(
          "Upload Study Material Error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to upload study material."
        );
      } finally {
        setUploading(false);
      }
    };

  // ==========================
  // VIEW
  // ==========================
  const handleView = async (
    material
  ) => {
    try {
      setViewingId(
        material.id
      );

      const response =
        await viewStudyMaterial(
          material.id
        );

      const blob =
        new Blob(
          [response.data],
          {
            type:
              response.headers[
                "content-type"
              ] ||
              material.fileType,
          }
        );

      const url =
        window.URL.createObjectURL(
          blob
        );

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );

      setTimeout(() => {
        window.URL.revokeObjectURL(
          url
        );
      }, 60000);
    } catch (error) {
      console.error(
        "View Study Material Error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Unable to view study material."
      );
    } finally {
      setViewingId(null);
    }
  };

  // ==========================
  // DOWNLOAD
  // ==========================
  const handleDownload =
    async (material) => {
      try {
        setDownloadingId(
          material.id
        );

        const response =
          await downloadStudyMaterial(
            material.id
          );

        const blob =
          new Blob(
            [response.data],
            {
              type:
                response.headers[
                  "content-type"
                ] ||
                material.fileType,
            }
          );

        const url =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          material.fileName;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );

        toast.success(
          "Study material downloaded successfully."
        );
      } catch (error) {
        console.error(
          "Download Study Material Error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to download study material."
        );
      } finally {
        setDownloadingId(
          null
        );
      }
    };

  // ==========================
  // DELETE
  // ==========================
  const handleDelete =
    async (material) => {
      const confirmed =
        window.confirm(
          `Delete "${material.title}"?`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          material.id
        );

        const response =
          await deleteStudyMaterial(
            material.id
          );

        toast.success(
          response.message ||
            "Study material deleted successfully."
        );

        await fetchMaterials();
      } catch (error) {
        console.error(
          "Delete Study Material Error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to delete study material."
        );
      } finally {
        setDeletingId(null);
      }
    };

  return (
    <div className="space-y-8 fade">

      {/* HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 border border-blue-500/20">

        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 mb-4">
            <BookOpen size={14} />
            Personal Study Library
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Study Materials
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 mt-2 max-w-2xl">
            Upload and manage your personal PDFs,
            documents, presentations, and images.
          </p>

        </div>
      </div>

      {/* UPLOAD CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <UploadCloud size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Upload Study Material
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Maximum file size: 20 MB
            </p>
          </div>

        </div>

        <form
          onSubmit={
            handleUpload
          }
          className="space-y-4"
        >

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Material Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              placeholder="e.g. DBMS Unit 1 Notes"
              maxLength={150}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>

            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select File
            </label>

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept={
                allowedExtensions
              }
              onChange={
                handleFileChange
              }
              className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white file:font-semibold hover:file:bg-blue-700"
            />

          </div>

          {selectedFile && (
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">

              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {formatFileSize(
                  selectedFile.size
                )}
              </p>

            </div>
          )}

          <button
            type="submit"
            disabled={
              uploading
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >

            {uploading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud
                  size={18}
                />
                Upload Material
              </>
            )}

          </button>

        </form>
      </div>

      {/* MATERIALS */}
      <div>

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Materials
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {materials.length} material
              {materials.length === 1
                ? ""
                : "s"} uploaded
            </p>
          </div>

        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center">

            <LoaderCircle
              size={30}
              className="animate-spin mx-auto text-blue-600"
            />

            <p className="text-sm text-slate-500 mt-3">
              Loading study materials...
            </p>

          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center">

            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen
                size={30}
              />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4">
              No study materials yet
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Upload your first study material above.
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {materials.map(
              (material) => (
                <div
                  key={
                    material.id
                  }
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex items-start gap-4">

                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      {getFileIcon(
                        material.fileType
                      )}
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="font-bold text-slate-900 dark:text-white truncate">
                        {material.title}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        {material.fileName}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">

                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <HardDrive
                            size={12}
                          />
                          {formatFileSize(
                            material.fileSize
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <FileText
                            size={12}
                          />
                          {getFileType(
                            material.fileType
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <CalendarDays
                            size={12}
                          />
                          {formatDate(
                            material.createdAt
                          )}
                        </span>

                      </div>

                    </div>

                  </div>

                  <div className="flex flex-wrap gap-2 mt-5">

                    <button
                      type="button"
                      onClick={() =>
                        handleView(
                          material
                        )
                      }
                      disabled={
                        viewingId ===
                        material.id
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 transition disabled:opacity-50"
                    >
                      {viewingId ===
                      material.id ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Eye
                          size={15}
                        />
                      )}
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(
                          material
                        )
                      }
                      disabled={
                        downloadingId ===
                        material.id
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition disabled:opacity-50"
                    >
                      {downloadingId ===
                      material.id ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Download
                          size={15}
                        />
                      )}
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(
                          material
                        )
                      }
                      disabled={
                        deletingId ===
                        material.id
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      {deletingId ===
                      material.id ? (
                        <LoaderCircle
                          size={15}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2
                          size={15}
                        />
                      )}
                      Delete
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}

export default StudyMaterials;