$.fn.NewProducts = function (options) {
    return this.each(function (index, el) {

        var defaults = $.extend({
            limit: 3,
            currencySymbol: "&#164;"
        });
        options = $.extend(defaults, options);

        var $this = $(this), $data = $this.find('#product-data');
        _getProducts(options.limit).then(products => {
            $data.empty();
            if (products.length > 0) {
                $.each(products, function (i, row) {
                    const product = _productDiv(row);
                    $data.append(product);
                });
            } else {
                $data.append("<div class='col-12 text-center'>No products found</div>");
            }
        }).catch(() => {
            $data.empty();
            $data.append("<div class='col-12 text-center'>Unable to load products</div>");
        });
    });

    function _productDiv(product) {
        const imageSrc = _normalizeImageSrc(product.image, '/img/awaiting-image-sm.png');
        return (
            "<div class='col-sm-6 col-lg-4 text-center item mb-4'>" +
            (product.onSale ? "<span class='tag'>Sale</span>" : "") +
            "<a href='/products/" + product.id + "'>" +
            "<img src='" + imageSrc + "' alt='Image' class='img-fluid'>" +
            "</a>" +
            "<h3 class='text-dark'><a href='/products/" + product.id + "'>" + product.name + "</a></h3>" +
            (product.onSale ? "<p class='price'><del>" + options.currencySymbol + Number(product.price).toFixed(2) + "</del> &mdash; " + options.currencySymbol + Number(product.salePrice).toFixed(2) + "</p>" : "<p class='price'>" + options.currencySymbol + Number(product.price).toFixed(2) + "</p>") +
            "</div>"
        );
    }

    function _normalizeImageSrc(image, fallback) {
        if (!image) {
            return fallback;
        }
        if (String(image).startsWith('/img/')) {
            return image;
        }
        return '/img/products/' + image;
    }

    async function _getProducts(limit) {
        return await $.get(`/api/v3/products?page=1&size=${limit}`).then(response => {
            if (response && response.data && Array.isArray(response.data.rows)) {
                return response.data.rows;
            }
            if (Array.isArray(response)) {
                return response;
            }
            return [];
        });
    }

};
