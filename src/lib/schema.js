// Schema generator utilities for JSON-LD structured data

export function generateArticleSchema(blog) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gujarat.taxi";
    const url = blog.canonicalUrl || `${baseUrl}/blogs/${blog.slug}`;
    const imageUrl = blog.image || `${baseUrl}/default-image.jpg`;

    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blog.metaTitle || blog.title,
        "description": blog.metaDescription || blog.description?.replace(/<[^>]+>/g, "").substring(0, 160) || "",
        "image": imageUrl,
        "datePublished": blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString(),
        "dateModified": blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString(),
        "author": {
            "@type": "Organization",
            "name": "Tripeaz",
            "url": baseUrl,
        },
        "publisher": {
            "@type": "Organization",
            "name": "Tripeaz",
            "url": baseUrl,
            "logo": {
                "@type": "ImageObject",
                "url": `${baseUrl}/logo.png`,
            },
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": url,
        },
        "url": url,
    };
}

export function generateFAQSchema(faqs) {
    if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
        return null;
    }

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
            },
        })),
    };
}

export function generateHowToSchema(steps) {
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
        return null;
    }

    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Guide",
        "step": steps.map((step, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name || `Step ${index + 1}`,
            "text": step.text || "",
            "image": step.image || "",
        })),
    };
}

export function generateOrganizationSchema() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://gujarat.taxi";

    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Tripeaz",
        "url": baseUrl,
        "logo": `${baseUrl}/logo.png`,
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["English", "Gujarati", "Hindi"],
        },
    };
}

export function generateBreadcrumbSchema(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
        return null;
    }

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url,
        })),
    };
}









