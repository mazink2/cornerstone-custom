import { hooks } from "@bigcommerce/stencil-utils";
import CatalogPage from "./catalog";
import compareProducts from "./global/compare-products";
import FacetedSearch from "./common/faceted-search";
import { createTranslationDictionary } from "../theme/common/utils/translations-utils";
import { toggleRemoveAllItemsBtn } from "./global/cart-preview";

export default class Category extends CatalogPage {
  constructor(context) {
    super(context);
    this.validationDictionary = createTranslationDictionary(context);
    this.$addAllToCartBtn = $(".add-all-to-cart-btn");
    this.originalAddBtnVal = this.$addAllToCartBtn.val();
    this.$removeAllItemsBtn = $(".remove-all-items-btn");
    this.originalRemoveBtnVal = this.$removeAllItemsBtn.val();
  }

  setLiveRegionAttributes($element, roleType, ariaLiveStatus) {
    $element.attr({
      role: roleType,
      "aria-live": ariaLiveStatus,
    });
  }

  makeShopByPriceFilterAccessible() {
    if (!$("[data-shop-by-price]").length) return;

    if ($(".navList-action").hasClass("is-active")) {
      $("a.navList-action.is-active").focus();
    }

    $("a.navList-action").on("click", () =>
      this.setLiveRegionAttributes(
        $("span.price-filter-message"),
        "status",
        "assertive"
      )
    );
  }

  onReady() {
    this.arrangeFocusOnSortBy();

    $('[data-button-type="add-cart"]').on("click", (e) =>
      this.setLiveRegionAttributes(
        $(e.currentTarget).next(),
        "status",
        "polite"
      )
    );

    this.makeShopByPriceFilterAccessible();

    compareProducts(this.context.urls);

    if ($("#facetedSearch").length > 0) {
      this.initFacetedSearch();
    } else {
      this.onSortBySubmit = this.onSortBySubmit.bind(this);
      hooks.on("sortBy-submitted", this.onSortBySubmit);
    }

    $("a.reset-btn").on("click", () =>
      this.setLiveRegionsAttributes($("span.reset-message"), "status", "polite")
    );

    this.ariaNotifyNoProducts();

    // Add all products in current category to cart
    $('[data-button-type="add-all-to-cart"]').on("click", () => {
      const here = this.getAllProductsAndAddToCart();
    });

    $('[data-button-type="remove-all-items"]').on("click", () => {
      console.log(this.context);
    });
  }

  ariaNotifyNoProducts() {
    const $noProductsMessage = $("[data-no-products-notification]");
    if ($noProductsMessage.length) {
      $noProductsMessage.focus();
    }
  }

  initFacetedSearch() {
    const {
      price_min_evaluation: onMinPriceError,
      price_max_evaluation: onMaxPriceError,
      price_min_not_entered: minPriceNotEntered,
      price_max_not_entered: maxPriceNotEntered,
      price_invalid_value: onInvalidPrice,
    } = this.validationDictionary;
    const $productListingContainer = $("#product-listing-container");
    const $facetedSearchContainer = $("#faceted-search-container");
    const productsPerPage = this.context.categoryProductsPerPage;
    const requestOptions = {
      config: {
        category: {
          shop_by_price: true,
          products: {
            limit: productsPerPage,
          },
        },
      },
      template: {
        productListing: "category/product-listing",
        sidebar: "category/sidebar",
      },
      showMore: "category/show-more",
    };

    this.facetedSearch = new FacetedSearch(
      requestOptions,
      (content) => {
        $productListingContainer.html(content.productListing);
        $facetedSearchContainer.html(content.sidebar);

        $("body").triggerHandler("compareReset");

        $("html, body").animate(
          {
            scrollTop: 0,
          },
          100
        );
      },
      {
        validationErrorMessages: {
          onMinPriceError,
          onMaxPriceError,
          minPriceNotEntered,
          maxPriceNotEntered,
          onInvalidPrice,
        },
      }
    );
  }

  // Get all products and add them to cart with addAllToCart method
  getAllProductsAndAddToCart(func) {
    const categoryUrl = this.$addAllToCartBtn.data("categoryUrl");
    const bearerToken = this.context.bearerToken;
    const waitMessage = this.$addAllToCartBtn.data("waitMessage");

    this.$addAllToCartBtn.val(waitMessage).prop("disabled", true);

    fetch("/graphql", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        query: `
            query CategoryByUrl {
                site {
                    route(path: "${categoryUrl}") {
                        node {
                            ... on Category {
                                products {
                                    edges {
                                        node {
                                            entityId
                                            name
                                            variants {
                                                edges {
                                                    node {
                                                        entityId
                                                        sku
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            `,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        const data = json?.data?.site?.route?.node?.products?.edges;

        if (data) {
          this.addAllToCart(data);
        } else {
          this.$addAllToCartBtn
            .val(this.originalAddBtnVal)
            .prop("disabled", false);
        }
      });
  }

  addAllToCart(data) {
    const that = this;
    const lineItems = [];

    data.forEach((item) => {
      const defaultVariant = item.node.variants.edges[0].node.entityId;

      const itemObj = {
        "quantity": 1,
        "productId": item.node.entityId,
        "variantId": defaultVariant,
      };

      lineItems.push(itemObj);
    });

    // Add items to cart
    fetch("/api/storefront/cart", { credentials: "include" })
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        if (!cart || (cart && cart.length == 0)) {
          // Cart is empty, use POST /api/storefront/cart
          that.addToCartRequest(`/api/storefront/carts`, lineItems);
        } else {
          that.addToCartRequest(
            `/api/storefront/carts/${cart[0].id}/items`,
            lineItems
          );
        }
      });
  }

  addToCartRequest(url, lineItems) {
    const that = this;

    fetch(url, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lineItems }),
    })
      .then((res) => res.json())
      .then((json) => {
        if(json?.lineItems) {
            const cartQuantity = that.countCartItems(json.lineItems);
            that.updateCartCounter(cartQuantity);

        }
      });
  }

  // Update cart details on front end
  updateCartCounter(quantity) {
    // Update cart counter
    const $body = $("body");

    $body.trigger("cart-quantity-update", quantity);
    const $cartCounter = $(".navUser-action .cart-count");
    $cartCounter.addClass("cart-count--positive");

    this.$addAllToCartBtn.val(this.originalAddBtnVal).prop("disabled", false);

    toggleRemoveAllItemsBtn(quantity);
  }

  // Count number of items in cart
  countCartItems(lineItems) {
    return Object.keys(lineItems).reduce((a, b) => {
      let acc = 0;

      lineItems[b].forEach((item) => {
        acc += item.quantity;
      });

      return acc + a;
    }, 0);
  }
}
