import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords }) => {
    return (
        <Helmet>
            <title>{title} | Signify</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta property="og:title" content={`${title} | Signify`} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${title} | Signify`} />
            <meta name="twitter:description" content={description} />
        </Helmet>
    );
};

SEO.defaultProps = {
    title: 'Signify',
    description: 'Secure, fast, and easy document signing solution.',
    keywords: 'esignature, sign pdf, digital signature, document signing, free esign'
};

export default SEO;
