/**
 * Every user-facing error message in Rooq — API responses and UI toasts.
 *
 * Rules
 *  - Never inline an error string anywhere else; add a key here and reference it.
 *  - Group by domain. Parametrised messages are small pure functions.
 *  - Wording is shown to shoppers and staff as-is: say what happened and what
 *    to do next, no stack-trace jargon.
 *
 * Seeded from every `throw new XxxException('…')` in the retired NestJS
 * backend plus its AllExceptionsFilter, so ported services keep their wording.
 */

const notFound = (entity: string) => (id: string) => `${entity} with ID ${id} not found`;

export const ERROR_MESSAGES = {
  common: {
    badRequest: "The server rejected this request as invalid. Check the values entered and try again.",
    unauthorized: "Unauthorized",
    sessionExpired: "Your session has expired. Sign in again to continue.",
    forbidden: "Your account does not have permission to do this.",
    notFound: "That record no longer exists. Refresh the page and try again.",
    conflict: "This conflicts with a record that already exists.",
    payloadTooLarge: "The file or data sent is too large for the server to accept.",
    tooManyRequests: "Too many requests in a short time. Wait a moment and try again.",
    serviceUnavailable: "The service is unreachable or still starting up. Try again in a moment.",
    invalidJson: "The request body is not valid JSON.",
    invalidId: "The id in the address is not valid.",
    methodNotAllowed: "This method is not allowed on this endpoint.",
    internal: (reference: string) =>
      `Something went wrong on the server while handling this request. Nothing was saved. Quote reference ${reference} when reporting it.`,
    statusFallback: (status: number) =>
      status >= 500
        ? `The server failed while handling this request (status ${status}). Nothing was saved.`
        : `Request failed with status ${status}.`,
  },

  /** HTTP reason phrases used in the `error` field of error bodies. */
  httpStatus: {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    413: "Payload Too Large",
    415: "Unsupported Media Type",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    503: "Service Unavailable",
  } as Record<number, string>,

  /** Wording of the Prisma error mapping (ported from AllExceptionsFilter). */
  database: {
    validation:
      "The data sent did not match what this endpoint expects. Check that every required field is filled in and that numbers are not left blank.",
    unreachable:
      "The server could not reach the database. It may still be starting up — try again in a moment.",
    uniqueField: (subject: string, fields: string, sentenceFields: string) =>
      `Another ${subject} already uses that ${fields}. ${sentenceFields} must be unique — pick a different value.`,
    uniqueGeneric: (subject: string) => `Another ${subject} with these details already exists.`,
    foreignKeyDelete: (subject: string) =>
      `This ${subject} is still used by other records, so it cannot be deleted. Remove or repoint those first.`,
    foreignKeyMissing: (subject: string, fields: string | null) =>
      `A linked record referenced by this ${subject} does not exist${fields ? ` (${fields})` : ""}. Refresh the page and pick again.`,
    requiredRelation: (subject: string) =>
      `This change would leave a related record without its required ${subject}. Update or remove the dependent records first.`,
    valueTooLong: (subject: string, fields: string | null) =>
      `The value given for ${fields ?? "one of the fields"} is too long for this ${subject}. Shorten it and try again.`,
    nullViolation: (subject: string, sentenceFields: string | null) =>
      `${sentenceFields ?? "A required field"} cannot be empty on this ${subject}.`,
    invalidValue: (subject: string, fields: string | null) =>
      `The value given for ${fields ?? "one of the fields"} is not valid for this ${subject}.`,
    recordGone: (subject: string) =>
      `The ${subject} you tried to change no longer exists — someone may have deleted it. Refresh the page and try again.`,
    rejected: (code: string) =>
      `The database rejected this change (${code}). Check the values entered and try again.`,
  },

  config: {
    databaseUrlMissing: "DATABASE_URL is not set",
    jwtSecretMissing: "JWT_SECRET is not set",
  },

  validation: {
    failed: "Validation failed",
    required: (field: string) => `${field} is required`,
    invalidEmail: "Enter a valid email address.",
    invalidUuid: (field: string) => `${field} must be a valid id`,
    minLength: (field: string, min: number) => `${field} must be at least ${min} characters`,
    unknownField: (field: string) => `property ${field} should not exist`,
    invalidHex: "Colour must be a hex value like #1A2B3C.",
    invalidSlug: "Slug may only contain lowercase letters, numbers and hyphens.",
    invalidDate: (field: string) => `${field} must be a valid ISO 8601 date string`,
  },

  auth: {
    unauthorized: "Unauthorized",
    sessionExpired: "Your session has expired. Sign in again to continue.",
    insufficientRole: "Insufficient role permissions",
    adminOnly: "Only admin users can access the admin panel.",
    registrationNeedsEmailAndPhone: "Both email and phone number are required for registration",
    emailExists: "Email already exists",
    phoneExists: "Phone number already exists",
    identifierRequired: "Email or phone number is required",
    invalidCredentials: "Invalid credentials",
    accountDisabled: "This account has been disabled. Contact support.",
    googleOnlyAccount: "This account uses Google sign-in. Please continue with Google.",
    googleNoEmail: "Google account has no email address",
    googleEmailUnverified: "Google email is not verified",
    googleUnreachable: "Could not reach Google to verify your account",
    googleTokenInvalid: "Invalid or expired Google access token",
    googleOnlyNoPassword: "This account uses Google sign-in and has no password to change.",
    currentPasswordIncorrect: "Current password is incorrect",
    resetTokenInvalid: "Invalid or expired reset token",
    loginFailed: "Login failed",
  },

  user: {
    notFound: "User not found",
    notFoundById: (id: string) => `User with id ${id} not found`,
    superadminDemote: "A superadmin account cannot be demoted to another role",
    superadminDelete: "Superadmin accounts cannot be deleted",
    loadFailed: "Could not load staff accounts. Refresh to try again.",
    saveFailed: "Could not save this account. Please try again.",
    deleteFailed: "Could not remove this account. Please try again.",
  },

  role: {
    notFound: notFound("Role"),
    protected: (name: string) => `The "${name}" role is protected and cannot be deleted`,
    stillAssigned: (count: number) =>
      `Cannot delete a role that is still assigned to ${count} user(s). Reassign them first.`,
    nameExists: "A role with that name already exists",
    loadFailed: "Could not load roles and permissions. Refresh to try again.",
    permissionsSaveFailed: "Could not save the role's permissions. Please try again.",
  },

  profile: {
    avatarRequired: "Avatar file is required",
    noAvatar: "No avatar found",
  },

  address: {
    notFound: "Address not found",
    notFoundForCustomer: "Address not found for this customer",
    usedInOrders: "Cannot delete address that is used in orders",
  },

  settings: {
    notFound: notFound("Setting"),
    notConfigured: "Settings have not been configured yet",
    loadFailed: "Could not load the store settings. Refresh to try again.",
    saveFailed: "Could not save the settings. Please try again.",
    imageUploadFailed: "Could not upload the image. Nothing was saved — try again.",
    invalidTime: "Times must use the 24-hour HH:mm format, e.g. 09:30.",
  },

  policy: {
    notFound: (type: string) => `Policy "${type}" not found`,
    loadFailed: "Could not load the policies. Refresh to try again.",
    saveFailed: "Could not save the policies. Please try again.",
  },

  product: {
    notFound: notFound("Product"),
    notFoundBySlug: (slug: string) => `Product with slug ${slug} not found`,
    mediaRequired: "Media file is required",
    mediaNotFound: notFound("Product media"),
    brandMissing: notFound("Brand"),
    categoryMissing: notFound("Category"),
    unitMissing: notFound("Unit"),
    supplierMissing: notFound("Supplier"),
    sizeChartMissing: notFound("Size chart"),
    invalidIds: "One or more product IDs are invalid",
    someNotFound: "One or more products were not found",
    archived: "This product has been archived and is no longer sold.",
    slugExists: (slug: string) => `A product with slug "${slug}" already exists`,
  },

  variant: {
    notFound: notFound("Variant"),
    notFoundShort: (id: string) => `Variant ${id} was not found`,
    mediaNotFound: notFound("Variant media"),
    noLongerSold: "This variant is no longer sold",
    skuNoLongerSold: (sku: string) => `SKU ${sku} is no longer sold`,
    notInProduct: (variantId: string, productId: string) =>
      `Variant ${variantId} does not belong to product ${productId}`,
    noneForProduct: (productId: string) => `No variant found for product ${productId}`,
    skuExists: (sku: string) => `SKU ${sku} is already used by another variant`,
    comboExists: "A variant with this colour and size already exists for the product",
    matrixEmpty: "Pick at least one colour and one size to generate variants.",
    selectSize: "Please select a size first.",
    selectColor: "Please select a colour first.",
    bulkEmpty: "Select at least one variant to update.",
    noneSelected: "Select the variants you want to change first.",
  },

  color: {
    notFound: notFound("Colour"),
    inUse: "This colour is used by product variants and cannot be deleted. Deactivate it instead.",
    nameExists: "A colour with that name already exists",
    someNotFound: "One or more colours were not found. Refresh the page and pick again.",
  },

  size: {
    notFound: notFound("Size"),
    inUse: "This size is used by product variants or size charts and cannot be deleted. Deactivate it instead.",
    labelExists: "That size label already exists in this size group",
    someNotFound: "One or more sizes were not found. Refresh the page and pick again.",
  },

  sizeChart: {
    notFound: notFound("Size chart"),
    duplicateSize: "Each size can appear only once in a size chart",
    noChart: "No size guide is available for this product yet.",
    duplicateColumn: (label: string) => `The column "${label}" appears twice in one row. Rename one of them.`,
  },

  collection: {
    notFound: notFound("Collection"),
    notFoundBySlug: (slug: string) => `Collection "${slug}" not found`,
    lookNotFound: notFound("Look"),
    slugExists: (slug: string) => `A collection with slug "${slug}" already exists`,
    invalidWindow: "End date must be after start date",
    someNotFound: "One or more collections were not found. Refresh the page and pick again.",
  },

  category: {
    notFound: notFound("Category"),
    parentNotFound: (id: string) => `Parent category with ID ${id} not found`,
    slugExists: (slug: string) => `A category with slug "${slug}" already exists`,
    duplicateInPayload: (id: string) => `Category ${id} appears more than once`,
    unknownIds: (ids: string[]) => `Unknown category id(s): ${ids.join(", ")}`,
    ownParent: (id: string) => `Category ${id} cannot be its own parent`,
    parentMissingFromPayload: (id: string) => `Parent ${id} is missing from the payload`,
    cycle: "Reorder would create a category cycle",
    hasChildren: "This category still has sub-categories. Move or delete them first.",
  },

  brand: {
    notFound: notFound("Brand"),
  },

  attribute: {
    notFound: notFound("Attribute"),
    valueNotFound: notFound("Attribute value"),
    someValuesNotFound: "One or more attribute values were not found. Refresh the page and pick again.",
  },

  tag: {
    notFound: notFound("Tag"),
    slugExists: "Tag slug already exists",
    someNotFound: "One or more tags were not found. Refresh the page and pick again.",
  },

  unit: {
    notFound: notFound("Unit"),
    codeExists: "Unit code already exists",
    hasChildren: (name: string, count: number) =>
      `Cannot delete "${name}" while ${count} unit(s) convert into it. Repoint or delete those first.`,
    parentNotFound: (id: string) => `Parent unit with ID ${id} not found`,
    ownParent: "A unit cannot be its own parent",
    circular: "That parent would create a circular unit conversion",
    factorPositive: "Factor must be greater than zero.",
  },

  inventory: {
    variantOrProduct: "Provide either variantId or productId",
    negativeStock: "Stock cannot go negative",
    insufficientStock: "Insufficient stock",
    insufficientStockForSku: (sku: string) => `Insufficient stock for SKU ${sku}`,
    onlyLeft: (count: number) => `Only ${count} left in stock`,
    outOfStock: "This size is out of stock",
    changeOrSetTo: "Send exactly one of change or setTo.",
    zeroChange: "The stock change cannot be zero.",
  },

  supplier: {
    notFound: notFound("Supplier"),
  },

  review: {
    notFound: notFound("Review"),
    alreadyReviewed: "You have already reviewed this product. Edit your existing review instead.",
    ratingRange: "Rating must be between 1 and 5",
    tooManyPhotos: (max: number) => `You can attach up to ${max} photos to a review`,
    notOwner: "You can only change your own review.",
    moderationStaffOnly: "Only staff can approve or reject reviews.",
    variantMismatch: "That size and colour do not belong to this product.",
    userNotFound: (id: string) => `User with ID ${id} not found`,
    loadFailed: "Could not load reviews. Refresh to try again.",
    updateFailed: "Could not update the review. Please try again.",
    deleteFailed: "Could not delete the review. Please try again.",
    createFailed: "Could not create the review. Please try again.",
  },

  search: {
    queryRequired: "Enter something to search for.",
  },

  section: {
    notFound: notFound("Section"),
    titleExists: (title: string, page: string) => `A section called "${title}" already exists on the ${page} page`,
    inUse: "This section still has campaigns. Move or delete them first.",
    loadFailed: "Could not load sections. Refresh to try again.",
  },

  news: {
    notFound: notFound("News article"),
    notFoundBySlug: (slug: string) => `News article "${slug}" not found`,
    slugExists: (slug: string) => `A news article with slug "${slug}" already exists`,
    titleRequired: "Title should not be empty",
    slugRequired: "Slug should not be empty",
    contentRequired: "Content should not be empty",
    loadFailed: "Could not load articles. Refresh to try again.",
    saveFailed: "Could not save the article. Please try again.",
    deleteFailed: "Could not delete the article. Please try again.",
  },

  campaign: {
    notFound: notFound("Campaign"),
    discountRequired: "discountId is required when hasDiscount is true",
    invalidWindow: "End date must be after start date",
    sectionNotFound: notFound("Section"),
    discountNotFound: notFound("Product discount"),
    tooManyImages: (max: number) => `A campaign can carry up to ${max} images`,
    invalidKeepImages: "keepImages must be a JSON array of image URLs",
    imageRequired: "At least one campaign image is required.",
    bannerSectionMissing: (title: string) => `No "${title}" section found. Run the database seed first.`,
    bannerImageRequired: "Add at least one banner image.",
    loadFailed: "Could not load campaigns. Refresh to try again.",
    saveFailed: "Could not save the campaign. Please try again.",
    deleteFailed: "Could not delete the campaign. Please try again.",
    statusFailed: "Could not change the campaign status. Please try again.",
    bannersLoadFailed: "Could not load the hero banners.",
    bannersSaveFailed: "Could not save the hero banners.",
    bannerRemoveFailed: "Could not remove the banner.",
  },

  heroSlide: {
    notFound: notFound("Hero slide"),
    imageRequired: "Choose an image for the slide.",
    productNotFound: notFound("Product"),
    reorderMismatch: "The slide order is out of date. Refresh and try again.",
    loadFailed: "Could not load the hero slides. Refresh to try again.",
    saveFailed: "Could not save the hero slide. Please try again.",
    deleteFailed: "Could not delete the hero slide. Please try again.",
    modeFailed: "Could not change what the hero shows. Please try again.",
  },

  discount: {
    notFound: notFound("Product discount"),
    invalidWindow: "End date must be after start date",
    fixedExceedsPrice: (value: number, count: number) =>
      `Fixed discount value (${value}) exceeds the retail price for ${count} product(s)`,
    percentageTooHigh: (max: number) => `A percentage discount cannot be more than ${max}%`,
    nameRequired: "Discount name is required.",
    valueRequired: "Discount value must be greater than 0.",
    productsRequired: "Please select at least one product to apply this discount.",
    loadFailed: "Could not load discounts. Refresh to try again.",
    saveFailed: "Could not save the discount. Please try again.",
    deleteFailed: "Could not delete the discount. Please try again.",
    statusFailed: "Could not change the discount status. Please try again.",
    productsLoadFailed: "Could not load products for this discount.",
  },

  coupon: {
    invalid: "Invalid coupon",
    expired: "Coupon expired",
    notStarted: "This coupon is not active yet",
    inactive: "This coupon is no longer active",
    usageLimit: "Coupon usage limit reached",
    minOrder: (amount: string) => `This coupon needs an order of at least ${amount}`,
    notFoundByCode: (code: string) => `Coupon ${code} not found`,
    notFound: notFound("Coupon"),
    codeExists: (code: string) => `A coupon with code "${code}" already exists`,
    percentageTooHigh: "A percentage coupon cannot be more than 100%",
    invalidWindow: "The expiry date must be after the start date",
    codeRequired: "Enter a coupon code.",
    valueRequired: "Coupon value must be greater than 0.",
    loadFailed: "Could not load coupons. Refresh to try again.",
    saveFailed: "Could not save the coupon. Please try again.",
    deleteFailed: "Could not delete the coupon. Please try again.",
  },

  cart: {
    empty: "Cart is empty",
    itemNotFound: notFound("Cart item"),
    noSelectedItems: "None of the selected items were found in your cart",
    duplicateItem: "Each size and colour can appear only once; combine the quantities into one line",
  },

  wishlist: {
    itemNotFound: "That product is not in your wishlist",
  },

  order: {
    notFound: notFound("Order"),
    cannotCancel: "This order cannot be cancelled",
    negativeTotal: "Order total cannot be negative",
    placeFailed: "We could not place your order. Please try again.",
    invalidTransition: (from: string, to: string) => `An order cannot move from ${from} to ${to}`,
    productUnavailable: (name: string) => `${name} is no longer available`,
    itemsRequired: "Add at least one item to the order.",
    loadFailed: "Could not load orders. Refresh to try again.",
    updateFailed: "Could not update the order. Please try again.",
    paymentOnlyWhenDelivered: "Payment status can only be changed for delivered orders.",
    cancelReasonRequired: "Give a reason for cancelling the order.",
  },

  pos: {
    productsLoadFailed: "Could not load products. Refresh to try again.",
    variantRequired: "Pick a size and colour first.",
    cartEmpty: "Add at least one item to the sale.",
    checkoutFailed: "Could not complete the sale. Please try again.",
  },

  payment: {
    notFound: notFound("Payment"),
    invalidMethod: (method: string) => `Unknown payment method: ${method}`,
    saveFailed: "Could not record the payment. Please try again.",
  },

  shipment: {
    notFound: notFound("Shipment"),
    saveFailed: "Could not save the shipment. Please try again.",
    courierRequired: "Enter the courier name.",
  },

  wholesale: {
    notFound: notFound("Wholesale request"),
    itemRequired: "At least one item is required",
    duplicateItem: "Duplicate product/variant in items; combine them into a single line",
    invalidTransition: (from: string, to: string) => `Invalid status transition from ${from} to ${to}`,
    notApproved: "Only approved requests can be converted",
    alreadyConverted: "This request has already been converted",
    itemNotInRequest: (id: string) => `Request item ${id} is not part of this request`,
    itemNeedsId: "Each item needs a requestItemId or a productId",
    duplicateVariant: "Duplicate variant across conversion items",
    loadFailed: "Could not load wholesale requests. Refresh to try again.",
    updateFailed: "Could not update the request. Please try again.",
    convertFailed: "Could not convert the request into an order. Please try again.",
  },

  returns: {
    notFound: notFound("Return request"),
    orderNotDelivered: "Returns can only be requested for delivered orders.",
    windowClosed: (days: number) => `The ${days}-day return window for this order has closed.`,
    itemNotInOrder: (id: string) => `Order item ${id} is not part of this order`,
    quantityExceeded: (sku: string, max: number) => `You can return at most ${max} of ${sku}`,
    itemRequired: "Select at least one item to return",
    exchangeVariantRequired: "Choose the size or colour you want in exchange",
    invalidTransition: (from: string, to: string) => `A return cannot move from ${from} to ${to}`,
    notOwner: "This return request belongs to another customer",
    duplicateItem: "Each order item can appear only once in a return request",
    exchangeVariantInvalid: "The exchange size or colour must be an available variant of the same product",
    exchangeOnlyForExchange: "Only exchange requests can name an exchange size or colour",
    onlyRequestedCancellable: "Only a return that has not been reviewed yet can be cancelled",
    refundTooHigh: (max: string) => `The refund cannot be more than ${max}`,
    noDeliveryDate: "This order has no delivery date yet, so a return cannot be opened.",
    loadFailed: "Could not load return requests. Refresh to try again.",
    updateFailed: "Could not update the return request. Please try again.",
  },

  contact: {
    requiredFields: "First name, phone number, and message are required.",
    sendFailed: "We could not send your message. Please try again later.",
  },

  newsletter: {
    emailRequired: "Email is required",
    alreadySubscribed: "This email is already subscribed!",
    notConfigured: "The newsletter is not configured on the server.",
  },

  backInStock: {
    notFound: notFound("Back-in-stock request"),
    alreadyInStock: "This size is in stock — you can add it to your bag now.",
    alreadySubscribed: "You are already on the list for this size. We will email you when it is back.",
  },

  media: {
    notFound: "Image not found",
    notFoundById: notFound("Media"),
    inUse: "This image is still used and cannot be deleted.",
    invalidImage: "The file could not be read as an image.",
    urlNotRecognised: "That image address is not one of the shop's uploads. Upload the image first, then use it.",
    urlOrIdRequired: "Send an uploaded image url or mediaId.",
  },

  upload: {
    fileRequired: "File is required",
    tooLarge: (maxMb: number) => `The file is larger than ${maxMb} MB. Choose a smaller image.`,
    unsupportedType: (allowed: string) => `Unsupported file type. Allowed: ${allowed}.`,
    multipartRequired: "Upload must be sent as multipart/form-data",
    failed: "Upload failed. Please try again.",
    imageTooLarge: (maxLabel: string) => `Image too large — max ${maxLabel}`,
    imageTooLargeDetail: (name: string, size: string) => `"${name}" is ${size}. Please compress or resize it and try again.`,
    imagesTooLarge: (count: number, maxLabel: string) => `${count} images too large — max ${maxLabel} each`,
    imagesTooLargeDetail: (names: string) => `Not added: ${names}. Please compress or resize them and try again.`,
    fileProblem: (name: string, problem: string) => `${name}: ${problem}`,
  },

  report: {
    invalidRange: "The start date must be before the end date.",
    unsupportedFormat: (format: string) => `Unsupported report format: ${format}`,
    invalidDate: "Dates must be ISO dates, e.g. 2026-05-31.",
    loadFailed: "Could not load this report. Refresh to try again.",
    downloadFailed: "Could not download the report. Please try again.",
    exportFailed: "Could not build the report file. Please try again.",
  },

  dashboard: {
    loadFailed: "Could not load the dashboard. Refresh to try again.",
    invalidPeriod: "Period must be one of today, yesterday, week, month or custom.",
    invalidGranularity: "Granularity must be daily, monthly or yearly.",
  },

  notification: {
    notFound: notFound("Notification"),
  },

  activityLog: {
    loadFailed: "Could not load the activity log. Refresh to try again.",
  },

  mail: {
    notConfigured: "Email is not configured on the server (RESEND_API_KEY missing).",
    sendFailed: "We could not send the email. Please try again later.",
  },

  /** Shopper-facing UI messages (storefront toasts, inline form errors, empty/error states). */
  storefront: {
    productsLoadFailed: "We could not load products right now. Refresh to try again.",
    productUnavailable: "This item is not available right now.",
    quickViewFailed: "Could not open this item. Try the product page instead.",
    addToBagFailed: "Could not add this to your bag. Please try again.",
    bagUpdateFailed: "Could not update your bag. Please try again.",
    bagSyncFailed: "Your bag could not be synced with your account. Your items are kept on this device.",
    soldOut: "This size is sold out.",
    quantityLimit: (max: number) => `Only ${max} left in this size.`,
    wishlistFailed: "Could not update your wishlist. Please try again.",
    compareFull: (max: number) => `You can compare up to ${max} items. Remove one first.`,
    reviewFailed: "Could not post your review. Please try again.",
    reviewsLoadFailed: "Could not load reviews. Refresh to try again.",
    ratingRequired: "Choose a star rating before posting.",
    backInStockFailed: "Could not save your request. Please try again.",
    emailInvalid: "Enter a valid email address.",
    couponRequired: "Enter a coupon code.",
    couponFailed: "That coupon could not be applied.",
    checkoutEmpty: "Your bag is empty. Add something before checking out.",
    addressIncomplete: "Fill in your name, phone, address and city.",
    phoneInvalid: "Enter a valid phone number.",
    ordersLoadFailed: "Could not load your orders. Refresh to try again.",
    orderCancelFailed: "Could not cancel this order. Please try again.",
    returnFailed: "Could not send your return request. Please try again.",
    returnNotEligible: "This order cannot be returned.",
    returnsLoadFailed: "Could not load your returns. Refresh to try again.",
    signInFailed: "Sign-in failed. Check your details and try again.",
    registerFailed: "Could not create your account. Please try again.",
    googleFailed: "Google sign-in did not complete. Try again or use your email.",
    passwordMismatch: "The passwords do not match.",
    passwordTooShort: (min: number) => `Use at least ${min} characters for your password.`,
    profileSaveFailed: "Could not save your details. Please try again.",
    addressSaveFailed: "Could not save this address. Please try again.",
    addressDeleteFailed: "Could not delete this address. Please try again.",
    newsletterFailed: "Could not sign you up. Please try again.",
    contactFailed: "Could not send your message. Please try again.",
    searchFailed: "Search is not responding. Try again in a moment.",
    pageNotFound: "We could not find that page. It may have moved or sold out.",
  },

  /** Developer invariants (a hook used outside its provider) — never shown to shoppers. */
  invariant: {
    outsideProvider: (hook: string, provider: string) => `${hook} must be used inside <${provider}>`,
  },

  ui: {
    generic: "Something went wrong. Please try again.",
    network: "Could not reach the server. Check your connection and try again.",
    timeout: "The server did not respond in time. Try again in a moment.",
    loadFailed: "Could not load this content. Refresh to try again.",
    saveFailed: "Could not save your changes. Please try again.",
    deleteFailed: "Could not delete this item. Please try again.",
    downloadFailed: (status: number) => `Download failed with status ${status}`,
    requiredFields: "Please fill in all required fields.",
    signInRequired: "Please sign in to continue.",
  },
} as const;

export type ErrorMessages = typeof ERROR_MESSAGES;
