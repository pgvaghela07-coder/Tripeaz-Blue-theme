"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import EditorSidebar from "@/components/editor/EditorSidebar";
import RevisionViewer from "@/components/editor/RevisionViewer";

// Dynamically import both CKEditor and ClassicEditor together with SSR disabled
const CKEditorWrapper = dynamic(
  async () => {
    const { CKEditor } = await import("@ckeditor/ckeditor5-react");
    const ClassicEditor = (await import("@ckeditor/ckeditor5-build-classic"))
      .default;

    return function EditorComponent(props) {
      return <CKEditor editor={ClassicEditor} {...props} />;
    };
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-64 border rounded-md p-4 bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 dark:text-black">Loading editor...</p>
      </div>
    ),
  }
);

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [data, setData] = useState({
    title: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    extra_metatag: "",
    faqs: [],
    categories: [],
    tags: [],
    scheduledAt: "",
    featuredImageAlt: "",
    status: "draft",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showRevisions, setShowRevisions] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishChoice, setPublishChoice] = useState("routes");
  const [routeForm, setRouteForm] = useState({
    from: "",
    to: "",
    name: "",
    url: "",
  });
  const [cityForm, setCityForm] = useState({
    name: "",
    url: "",
  });
  const [airportForm, setAirportForm] = useState({
    name: "",
    from: "",
    to: "",
    url: "",
  });

  const addFAQ = () => {
    setData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: "", answer: "" }]
    }));
  };

  const removeFAQ = (index) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const updateFAQ = (index, field, value) => {
    setData(prev => ({
      ...prev,
      faqs: prev.faqs.map((faq, i) => 
        i === index ? { ...faq, [field]: value } : faq
      )
    }));
  };

  // Fetch existing blog data
  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) {
        toast.error("Blog ID is missing");
        router.push("/admin/blog/manage");
        return;
      }

      try {
        console.log("Fetching blog with ID:", id);
        const res = await fetch(`/api/blogs/${id}`, {
          cache: "no-store",
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
          }
        });
        
        console.log("Response status:", res.status);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
          console.error("API error:", errorData.message || "Unknown error");
          toast.error(errorData.message || "Blog not found");
          router.push("/admin/blog/manage");
          return;
        }

        const result = await res.json();
        console.log("Response data:", result);

        if (!result.success || !result.blog) {
          console.error("API error:", result.message || "Blog not found");
          toast.error(result.message || "Blog not found");
          router.push("/admin/blog/manage");
          return;
        }

        const blog = result.blog;
        console.log("Blog data loaded:", blog.title);
        
        setData({
          title: blog.title || "",
          slug: blog.slug || "",
          description: blog.description || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          metaKeywords: Array.isArray(blog.metaKeywords)
            ? blog.metaKeywords.join(", ")
            : (typeof blog.metaKeywords === 'string' ? blog.metaKeywords : ""),
          extra_metatag: blog.extra_metatag || "",
          faqs: Array.isArray(blog.faqs) ? blog.faqs : [],
          categories: Array.isArray(blog.categories) && blog.categories.length > 0
            ? blog.categories
                .filter(cat => cat && (cat._id || typeof cat === 'string'))
                .map(cat => typeof cat === 'object' && cat._id ? cat._id : cat)
            : [],
          tags: Array.isArray(blog.tags) && blog.tags.length > 0
            ? blog.tags
                .filter(tag => tag && (tag._id || typeof tag === 'string'))
                .map(tag => typeof tag === 'object' && tag._id ? tag._id : tag)
            : [],
          scheduledAt: blog.scheduledAt
            ? new Date(blog.scheduledAt).toISOString().slice(0, 16)
            : "",
          featuredImageAlt: blog.featuredImageAlt || "",
          status: blog.status || "draft",
        });
        
        if (blog.image) {
          setExistingImage(blog.image);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        console.error("Error details:", error.message, error.stack);
        toast.error(`Failed to load blog: ${error.message || "Unknown error"}`);
        router.push("/admin/blog/manage");
      } finally {
        setFetching(false);
      }
    };

    fetchBlog();
  }, [id, router]);


  // Auto-save revisions every 30 seconds
  useEffect(() => {
    if (!id || !data.title || !data.description) return;

    const autoSaveInterval = setInterval(async () => {
      try {
        await fetch(`/api/blogs/${id}/revisions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentHtml: data.description,
            title: data.title,
            description: data.description,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            excerpt: data.description?.replace(/<[^>]+>/g, "").substring(0, 200) || "",
          }),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [id, data]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({ ...data, [name]: value });

    if (name === "title") {
      const slugValue = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setData((prev) => ({ ...prev, slug: slugValue }));
    }
  };

  const handleSaveWithRoute = async (routePayload = null, cityPayload = null, airportPayload = null) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("slug", data.slug);
      formData.append("description", data.description);
      formData.append("metaTitle", data.metaTitle);
      formData.append("metaDescription", data.metaDescription);
      formData.append("metaKeywords", data.metaKeywords);
      formData.append("extra_metatag", data.extra_metatag);
      formData.append("faqs", JSON.stringify(data.faqs));
      formData.append("categories", JSON.stringify(data.categories));
      formData.append("tags", JSON.stringify(data.tags));
      formData.append("status", data.status);
      if (data.scheduledAt) formData.append("scheduledAt", data.scheduledAt);
      if (data.featuredImageAlt) formData.append("featuredImageAlt", data.featuredImageAlt);
      if (image) formData.append("image", image);

      const res = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        // Save revision on manual save
        try {
          await fetch(`/api/blogs/${id}/revisions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contentHtml: data.description,
              title: data.title,
              description: data.description,
              metaTitle: data.metaTitle,
              metaDescription: data.metaDescription,
              excerpt: data.description?.replace(/<[^>]+>/g, "").substring(0, 200) || "",
            }),
          });
        } catch (error) {
          console.error("Failed to save revision:", error);
        }

        if (routePayload) {
          const payload = {
            name: routePayload.name?.trim() || data.title,
            from: routePayload.from?.trim(),
            to: routePayload.to?.trim(),
            url: routePayload.url?.trim() || data.slug,
            blogId: id,
          };

          if (!payload.from || !payload.to || !payload.url || !payload.name) {
            toast.error("Route details are required");
            setLoading(false);
            return;
          }

          try {
            const routeRes = await fetch("/api/routes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const routeData = await routeRes.json();
            if (routeData.success) {
              toast.success("Route created from blog");
            } else {
              toast.error(routeData.message || "Blog updated but route failed");
            }
          } catch (routeError) {
            console.error("Error creating route:", routeError);
            toast.error("Blog updated but route creation failed");
          }
        }

        if (cityPayload) {
          const payload = {
            name: cityPayload.name?.trim(),
            url: cityPayload.url?.trim() || data.slug,
            blogId: id,
          };

          if (!payload.name || !payload.url) {
            toast.error("City details are required");
            setLoading(false);
            return;
          }

          try {
            const cityRes = await fetch("/api/cities", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const cityData = await cityRes.json();
            if (cityData.success) {
              toast.success("City created from blog");
            } else {
              toast.error(cityData.message || "Blog updated but city failed");
            }
          } catch (cityError) {
            console.error("Error creating city:", cityError);
            toast.error("Blog updated but city creation failed");
          }
        }

        if (airportPayload) {
          const payload = {
            name: airportPayload.name?.trim(),
            from: airportPayload.from?.trim(),
            to: airportPayload.to?.trim(),
            url: airportPayload.url?.trim() || data.slug,
            blogId: id,
          };

          if (!payload.name || !payload.from || !payload.to || !payload.url) {
            toast.error("Airport details are required");
            setLoading(false);
            return;
          }

          try {
            const airportRes = await fetch("/api/airports", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
            const airportData = await airportRes.json();
            if (airportData.success) {
              toast.success("Airport created from blog");
            } else {
              toast.error(airportData.message || "Blog updated but airport failed");
            }
          } catch (airportError) {
            console.error("Error creating airport:", airportError);
            toast.error("Blog updated but airport creation failed");
          }
        }

        toast.success(result.message);
        router.push("/admin/blog/manage");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.log("error in Edit_blog..", error);
      toast.error("Something went wrong...");
    } finally {
      setLoading(false);
      setShowPublishModal(false);
    }
  };

  const handleConfirmPublish = async () => {
    if (publishChoice === "routes") {
      if (!routeForm.from.trim() || !routeForm.to.trim()) {
        toast.error("Please fill From and To");
        return;
      }
      await handleSaveWithRoute({
        ...routeForm,
        name: routeForm.name || data.title,
        url: routeForm.url || data.slug,
      }, null, null);
    } else if (publishChoice === "cities") {
      if (!cityForm.name.trim()) {
        toast.error("Please fill City Name");
        return;
      }
      await handleSaveWithRoute(null, {
        ...cityForm,
        url: cityForm.url || data.slug,
      }, null);
    } else if (publishChoice === "airport") {
      if (!airportForm.name.trim() || !airportForm.from.trim() || !airportForm.to.trim()) {
        toast.error("Please fill Airport Name, From and To");
        return;
      }
      await handleSaveWithRoute(null, null, {
        ...airportForm,
        url: airportForm.url || data.slug,
      });
    } else {
      await handleSaveWithRoute(null, null, null);
    }
  };

  const handlePublishClick = () => {
    setRouteForm({
      from: "",
      to: "",
      name: data.title || "",
      url: data.slug || "",
    });
    setCityForm({
      name: "",
      url: data.slug || "",
    });
    setAirportForm({
      name: data.title || "",
      from: "",
      to: "",
      url: data.slug || "",
    });
    setPublishChoice("routes");
    setShowPublishModal(true);
  };

  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300 ">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 dark:text-black">Edit Blog</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area - 70% */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handlePublishClick();
            }}
            className="space-y-4"
          >
        <div>
          <label className="block font-semibold dark:text-black">Title</label>
          <input
            type="text"
            name="title"
            value={data.title}
            onChange={handleChange}
            className="w-full border rounded-md p-2 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div>
          <label className="block font-semibold dark:text-black">Slug</label>
          <input
            type="text"
            name="slug"
            value={data.slug}
            onChange={handleChange}
            className="w-full border rounded-md p-2 
                     bg-gray-100 text-black border-gray-300 
                     dark:bg-gray-700 dark:text-white dark:border-gray-600"
            readOnly
          />
        </div>


        <div>
          <label className="block font-semibold dark:text-black">Description</label>
          <div className="ckeditor-wrapper dark:bg-gray-800">
            <CKEditorWrapper
              data={data.description}
              onChange={(_, editor) => {
                const content = editor.getData();
                setData((prev) => ({ ...prev, description: content }));
              }}
            />
          </div>
        </div>


        {/* FAQs Section */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-700 dark:text-black">FAQs</h2>
            <button
              type="button"
              onClick={addFAQ}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              + Add FAQ
            </button>
          </div>

          {data.faqs.map((faq, index) => (
            <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <label className="block font-semibold text-sm dark:text-black">
                  FAQ {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => removeFAQ(index)}
                  className="text-red-600 hover:text-red-800 text-sm font-semibold"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter question..."
                value={faq.question || ""}
                onChange={(e) => updateFAQ(index, "question", e.target.value)}
                className="w-full border rounded-md p-2 mb-2 
                         bg-white text-black border-gray-300 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <textarea
                placeholder="Enter answer..."
                value={faq.answer || ""}
                onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                rows="3"
                className="w-full border rounded-md p-2 
                         bg-white text-black border-gray-300 
                         dark:bg-gray-800 dark:text-white dark:border-gray-600
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          {data.faqs.length === 0 && (
            <p className="text-gray-500 text-sm italic">No FAQs added yet. Click "Add FAQ" to add one.</p>
          )}
        </div>


        {/* SEO Fields */}
        <div className="border-t pt-4 mt-4">
          <h2 className="text-xl font-bold mb-2 text-gray-700 dark:text-black">SEO Metadata</h2>

          <label className="block font-semibold dark:text-black">Meta Title</label>
          <input
            type="text"
            name="metaTitle"
            value={data.metaTitle}
            onChange={handleChange}
            className="w-full border rounded-md p-2 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={60}
          />

          <label className="block font-semibold mt-3 dark:text-black">Meta Description</label>
          <textarea
            name="metaDescription"
            value={data.metaDescription}
            onChange={handleChange}
            className="w-full border rounded-md p-2 h-20 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={160}
          />

          <label className="block font-semibold mt-3 dark:text-black">Meta Keywords</label>
          <input
            type="text"
            name="metaKeywords"
            value={data.metaKeywords}
            onChange={handleChange}
            placeholder="travel, gujarat, tourism"
            className="w-full border rounded-md p-2 
                     bg-white text-black placeholder-gray-500 border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="block font-semibold mt-3 dark:text-black">Extra Meta-Tags</label>
          <textarea
            name="extra_metatag"
            value={data.extra_metatag}
            onChange={handleChange}
            className="w-full border rounded-md p-2 h-20 
                     bg-white text-black border-gray-300 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
            maxLength={160}
          />
        </div>

          </form>
        </div>

        {/* Sidebar - 30% */}
        <div className="w-full lg:w-80 xl:w-96">
          <EditorSidebar
            data={data}
            setData={setData}
            image={image}
            preview={preview}
            existingImage={existingImage}
            onImageChange={handleImageChange}
            onSubmit={handlePublishClick}
            loading={loading}
            isEdit={true}
          />
        </div>
      </div>

      {/* Revisions Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Revision History</h2>
          <button
            onClick={() => setShowRevisions(!showRevisions)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showRevisions ? "Hide" : "Show"} Revisions
          </button>
        </div>
        {showRevisions && (
          <RevisionViewer
            blogId={id}
            currentContent={data.description}
            onRestore={(restoredBlog) => {
              setData({
                ...data,
                title: restoredBlog.title,
                description: restoredBlog.description,
                metaTitle: restoredBlog.metaTitle,
                metaDescription: restoredBlog.metaDescription,
              });
              toast.success("Content restored from revision");
            }}
          />
        )}
        {lastSaved && (
          <p className="text-xs text-gray-500 mt-2">
            Last auto-saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold text-gray-800">After updating</h3>
              <button onClick={() => setShowPublishModal(false)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>

            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-700">Choose where to link this blog:</p>
              <div className="grid grid-cols-2 gap-3">
                {["routes", "cities", "airport", "skip"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setPublishChoice(option)}
                    className={`border rounded-md px-3 py-2 text-sm font-semibold capitalize ${
                      publishChoice === option ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {publishChoice === "routes" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">Route name</label>
                    <input
                      type="text"
                      value={routeForm.name}
                      onChange={(e) => setRouteForm({ ...routeForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">From</label>
                      <input
                        type="text"
                        value={routeForm.from}
                        onChange={(e) => setRouteForm({ ...routeForm, from: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Ahmedabad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">To</label>
                      <input
                        type="text"
                        value={routeForm.to}
                        onChange={(e) => setRouteForm({ ...routeForm, to: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Vadodara"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={routeForm.url}
                      onChange={(e) => setRouteForm({ ...routeForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}

              {publishChoice === "cities" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">City Name</label>
                    <input
                      type="text"
                      value={cityForm.name}
                      onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={cityForm.url}
                      onChange={(e) => setCityForm({ ...cityForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}

              {publishChoice === "airport" && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">Airport Name</label>
                    <input
                      type="text"
                      value={airportForm.name}
                      onChange={(e) => setAirportForm({ ...airportForm, name: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Enter airport name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">From</label>
                      <input
                        type="text"
                        value={airportForm.from}
                        onChange={(e) => setAirportForm({ ...airportForm, from: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Ahmedabad"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800">To</label>
                      <input
                        type="text"
                        value={airportForm.to}
                        onChange={(e) => setAirportForm({ ...airportForm, to: e.target.value })}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Vadodara"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">URL</label>
                    <input
                      type="text"
                      value={airportForm.url}
                      onChange={(e) => setAirportForm({ ...airportForm, url: e.target.value })}
                      className="w-full border rounded-md p-2 text-sm"
                      placeholder="Auto-filled from blog slug"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use the full path you want to open.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 flex justify-end gap-3">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 rounded-md border text-sm font-semibold text-gray-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Saving..." : "Update & Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
