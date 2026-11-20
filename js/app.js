// ==========================================================================
// Rico e Doce Bakery - Lógica de Aplicación
// ==========================================================================

// Estado global de la aplicación
const AppState = {
    cart: [],
    selectedCategory: 'all',
    searchQuery: '',
    deliveryMethod: 'pickup', // 'pickup' o 'delivery'
    deliveryCost: 2800,
    freeDeliveryThreshold: 30000,
    appliedCoupon: null,
    validCoupons: {
        'DOCE10': { discount: 0.10, label: '10% OFF Bienvenida' },
        'DULCE10': { discount: 0.10, label: '10% OFF Bienvenida' },
        'PASTELERO15': { discount: 0.15, label: '15% OFF Especial' },
        'DEGUSTACION': { discount: 0.20, label: '20% OFF Club Dulce' }
    },
    customCake: {
        size: 's-medium',
        sponge: 'sp-vanilla',
        filling: 'f-ddl',
        extras: [],
        style: 'st-semi',
        dedication: '',
        notes: ''
    }
};

// Formateador de moneda en pesos argentinos / moneda local
const formatPrice = (amount) => {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(amount);
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    loadCartFromStorage();
    renderProducts();
    initCategoryFilters();
    initSearchInput();
    initCakeBuilder();
    initFaqAccordion();
    initCartDrawerListeners();
    initQuickViewModalListeners();
    initMobileNav();
    updateCartUI();
});

// ==========================================================================
// RENDERIZADO DE PRODUCTOS Y FILTROS
// ==========================================================================

function getFilteredProducts() {
    return PRODUCTS_DATA.filter(product => {
        const matchesCategory = AppState.selectedCategory === 'all' || product.category === AppState.selectedCategory;
        const query = AppState.searchQuery.trim().toLowerCase();
        const matchesSearch = !query || 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            product.ingredients.some(i => i.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });
}

function renderProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('products-empty');
    if (!grid) return;

    const products = getFilteredProducts();

    if (products.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    grid.innerHTML = products.map(product => `
        <div class="product-card bg-white rounded-2xl overflow-hidden border border-[#F3CDE0] flex flex-col justify-between group shadow-sm hover:shadow-xl transition-all">
            <!-- Imagen con badge -->
            <div class="relative overflow-hidden aspect-[4/3] bg-[#FFF0F6] cursor-pointer" onclick="openQuickView('${product.id}')">
                <img 
                    src="${product.image}" 
                    alt="${product.name}" 
                    loading="lazy"
                    class="img-zoom w-full h-full object-cover"
                />
                ${product.badge ? `
                    <span class="corner-ribbon text-xs font-semibold px-3 py-1 rounded-full text-white shadow-md ${product.badgeColor}">
                        ${product.badge}
                    </span>
                ` : ''}
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button class="bg-white/95 text-[#22181F] text-xs font-semibold px-4 py-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all flex items-center gap-2">
                        <i class="fa-solid fa-eye text-[#D84C7B]"></i> Ver detalles
                    </button>
                </div>
            </div>

            <!-- Contenido -->
            <div class="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between text-xs text-[#D84C7B] font-medium mb-1">
                        <span>${product.categoryLabel}</span>
                        <span class="flex items-center gap-1 text-[#6E5664]">
                            <i class="fa-solid fa-user-group text-[10px]"></i> ${product.portions}
                        </span>
                    </div>

                    <h3 class="font-serif-title font-bold text-lg text-[#22181F] mb-2 group-hover:text-[#D84C7B] transition-colors leading-snug cursor-pointer" onclick="openQuickView('${product.id}')">
                        ${product.name}
                    </h3>

                    <p class="text-xs text-[#6E5664] line-clamp-2 mb-4 leading-relaxed">
                        ${product.description}
                    </p>
                </div>

                <!-- Precio y botón -->
                <div class="pt-3 border-t border-[#F7DDEB] flex items-center justify-between gap-3">
                    <div>
                        <span class="text-[11px] uppercase tracking-wider text-[#9C7F90] block">Precio</span>
                        <span class="font-serif-title text-xl font-bold text-[#22181F]">
                            ${formatPrice(product.price)}
                        </span>
                    </div>

                    <button 
                        onclick="addToCart('${product.id}')"
                        class="bg-[#D84C7B] hover:bg-[#B92E5E] active:scale-95 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                        title="Agregar ${product.name} al carrito"
                    >
                        <i class="fa-solid fa-cart-plus"></i>
                        <span>Agregar</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function initCategoryFilters() {
    const buttons = document.querySelectorAll('.category-filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => {
                b.classList.remove('bg-[#D84C7B]', 'text-white', 'shadow-md');
                b.classList.add('bg-white', 'text-[#6E5664]', 'border', 'border-[#ECC0D6]');
            });

            btn.classList.add('bg-[#D84C7B]', 'text-white', 'shadow-md');
            btn.classList.remove('bg-white', 'text-[#6E5664]', 'border', 'border-[#ECC0D6]');

            AppState.selectedCategory = btn.getAttribute('data-category');
            renderProducts();
        });
    });
}

function initSearchInput() {
    const input = document.getElementById('search-products');
    const clearBtn = document.getElementById('search-clear');
    if (!input) return;

    input.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value;
        if (clearBtn) {
            clearBtn.classList.toggle('hidden', !e.target.value);
        }
        renderProducts();
    });

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            input.value = '';
            AppState.searchQuery = '';
            clearBtn.classList.add('hidden');
            renderProducts();
            input.focus();
        });
    }
}

// ==========================================================================
// MODAL VISTA RÁPIDA (QUICK VIEW)
// ==========================================================================

let currentQuickViewProduct = null;
let quickViewQuantity = 1;

function openQuickView(productId) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    currentQuickViewProduct = product;
    quickViewQuantity = 1;

    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    document.getElementById('qv-image').src = product.image;
    document.getElementById('qv-image').alt = product.name;
    document.getElementById('qv-category').textContent = product.categoryLabel;
    document.getElementById('qv-name').textContent = product.name;
    document.getElementById('qv-price').textContent = formatPrice(product.price);
    document.getElementById('qv-portions').textContent = product.portions;
    document.getElementById('qv-description').textContent = product.description;
    document.getElementById('qv-storage').textContent = product.storage;
    document.getElementById('qv-qty').textContent = quickViewQuantity;

    // Ingredientes
    const ingContainer = document.getElementById('qv-ingredients');
    ingContainer.innerHTML = product.ingredients.map(ing => 
        `<span class="bg-[#FFEDF6] text-[#B92E5E] text-xs px-2.5 py-1 rounded-md font-medium">${ing}</span>`
    ).join('');

    // Alérgenos
    const allContainer = document.getElementById('qv-allergens');
    allContainer.innerHTML = product.allergens.map(allg => 
        `<span class="bg-amber-50 text-amber-800 border border-amber-200 text-xs px-2.5 py-1 rounded-md">${allg}</span>`
    ).join('');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function initQuickViewModalListeners() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    document.getElementById('qv-close')?.addEventListener('click', closeQuickView);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeQuickView();
    });

    document.getElementById('qv-qty-minus')?.addEventListener('click', () => {
        if (quickViewQuantity > 1) {
            quickViewQuantity--;
            document.getElementById('qv-qty').textContent = quickViewQuantity;
        }
    });

    document.getElementById('qv-qty-plus')?.addEventListener('click', () => {
        quickViewQuantity++;
        document.getElementById('qv-qty').textContent = quickViewQuantity;
    });

    document.getElementById('qv-add-to-cart')?.addEventListener('click', () => {
        if (currentQuickViewProduct) {
            addToCart(currentQuickViewProduct.id, quickViewQuantity);
            closeQuickView();
        }
    });
}

// ==========================================================================
// CARRITO DE COMPRAS
// ==========================================================================

function loadCartFromStorage() {
    try {
        const saved = localStorage.getItem('dulce_atelier_cart');
        if (saved) {
            AppState.cart = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error cargando carrito de storage', e);
        AppState.cart = [];
    }
}

function saveCartToStorage() {
    try {
        localStorage.setItem('dulce_atelier_cart', JSON.stringify(AppState.cart));
    } catch (e) {
        console.error('Error guardando carrito', e);
    }
}

function addToCart(productId, quantity = 1) {
    const product = PRODUCTS_DATA.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = AppState.cart.findIndex(item => item.id === productId && item.type === 'standard');

    if (existingIndex > -1) {
        AppState.cart[existingIndex].quantity += quantity;
    } else {
        AppState.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            portions: product.portions,
            quantity: quantity,
            type: 'standard'
        });
    }

    saveCartToStorage();
    updateCartUI();
    showToast('¡Agregado al carrito!', `${product.name} (x${quantity})`, 'fa-cart-shopping', 'success');
    animateCartIcon();
}

function addCustomCakeToCart(customCakeItem) {
    AppState.cart.push(customCakeItem);
    saveCartToStorage();
    updateCartUI();
    showToast('¡Torta Personalizada Agregada!', customCakeItem.name, 'fa-cake-candles', 'success');
    animateCartIcon();
    openCartDrawer();
}

function updateCartItemQuantity(index, delta) {
    if (AppState.cart[index]) {
        AppState.cart[index].quantity += delta;
        if (AppState.cart[index].quantity <= 0) {
            AppState.cart.splice(index, 1);
            showToast('Producto eliminado', 'El ítem se retiró del carrito', 'fa-trash', 'info');
        }
        saveCartToStorage();
        updateCartUI();
    }
}

function removeCartItem(index) {
    if (AppState.cart[index]) {
        const name = AppState.cart[index].name;
        AppState.cart.splice(index, 1);
        saveCartToStorage();
        updateCartUI();
        showToast('Eliminado', `${name} fue retirado`, 'fa-trash', 'info');
    }
}

function clearCart() {
    if (AppState.cart.length === 0) return;
    if (confirm('¿Deseas vaciar todo tu carrito de compras?')) {
        AppState.cart = [];
        saveCartToStorage();
        updateCartUI();
        showToast('Carrito vacío', 'Se eliminaron todos los productos', 'fa-broom', 'info');
    }
}

function calculateCartTotals() {
    const subtotal = AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Descuento
    let discountAmount = 0;
    if (AppState.appliedCoupon && AppState.validCoupons[AppState.appliedCoupon]) {
        discountAmount = subtotal * AppState.validCoupons[AppState.appliedCoupon].discount;
    }

    // Envío
    let shipping = 0;
    let isFreeShipping = false;
    if (AppState.deliveryMethod === 'delivery') {
        if (subtotal >= AppState.freeDeliveryThreshold) {
            shipping = 0;
            isFreeShipping = true;
        } else {
            shipping = AppState.deliveryCost;
        }
    }

    const total = Math.max(0, subtotal - discountAmount + shipping);

    return {
        subtotal,
        discountAmount,
        shipping,
        isFreeShipping,
        total,
        totalItems: AppState.cart.reduce((sum, item) => sum + item.quantity, 0)
    };
}

function updateCartUI() {
    const totals = calculateCartTotals();

    // Badges en navbar y flotante
    const countBadges = document.querySelectorAll('.cart-count-badge');
    countBadges.forEach(badge => {
        badge.textContent = totals.totalItems;
        badge.classList.toggle('hidden', totals.totalItems === 0);
    });

    const itemsContainer = document.getElementById('cart-items-container');
    const emptyState = document.getElementById('cart-empty-state');
    const footerContainer = document.getElementById('cart-footer');

    if (!itemsContainer) return;

    if (AppState.cart.length === 0) {
        itemsContainer.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (footerContainer) footerContainer.classList.add('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (footerContainer) footerContainer.classList.remove('hidden');

    itemsContainer.innerHTML = AppState.cart.map((item, index) => `
        <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#F5D6E5] shadow-sm">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-[#FBF7F4]" />
            <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-sm text-[#22181F] truncate">${item.name}</h4>
                ${item.type === 'custom' ? `
                    <p class="text-[11px] text-[#825E73] line-clamp-1 italic">${item.detailsSummary}</p>
                ` : `
                    <p class="text-[11px] text-[#825E73]">${item.portions || ''}</p>
                `}
                <div class="font-serif-title text-[#D84C7B] font-bold text-sm mt-1">
                    ${formatPrice(item.price)}
                </div>
            </div>

            <!-- Cantidad y Borrar -->
            <div class="flex flex-col items-end justify-between gap-2">
                <button onclick="removeCartItem(${index})" class="text-[#A68C9B] hover:text-red-500 text-xs transition-colors p-1" title="Quitar">
                    <i class="fa-solid fa-xmark"></i>
                </button>
                <div class="flex items-center border border-[#ECC0D6] rounded-lg bg-[#FFF0F6]">
                    <button onclick="updateCartItemQuantity(${index}, -1)" class="w-6 h-6 flex items-center justify-center text-xs text-[#6E5664] hover:bg-[#F3CDE0] rounded-l-lg transition-colors">
                        -
                    </button>
                    <span class="w-6 text-center text-xs font-semibold text-[#22181F]">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${index}, 1)" class="w-6 h-6 flex items-center justify-center text-xs text-[#6E5664] hover:bg-[#F3CDE0] rounded-r-lg transition-colors">
                        +
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Actualizar valores numéricos
    document.getElementById('cart-subtotal').textContent = formatPrice(totals.subtotal);
    
    // Envío en UI
    const shippingEl = document.getElementById('cart-shipping');
    if (AppState.deliveryMethod === 'pickup') {
        shippingEl.textContent = 'Gratis (Retiro en taller)';
        shippingEl.className = 'text-xs font-medium text-emerald-600';
    } else if (totals.isFreeShipping) {
        shippingEl.textContent = '¡Envío Gratis!';
        shippingEl.className = 'text-xs font-medium text-emerald-600';
    } else {
        shippingEl.textContent = formatPrice(totals.shipping);
        shippingEl.className = 'text-xs font-medium text-[#22181F]';
    }

    // Barra de progreso para envío gratis
    const freeShippingProgress = document.getElementById('free-shipping-progress');
    const freeShippingText = document.getElementById('free-shipping-text');
    if (freeShippingProgress && freeShippingText) {
        const remaining = AppState.freeDeliveryThreshold - totals.subtotal;
        if (remaining <= 0) {
            freeShippingProgress.style.width = '100%';
            freeShippingText.innerHTML = `🎉 <strong>¡Felicidades!</strong> Tenés envío a domicilio 100% GRATIS`;
        } else {
            const pct = Math.min(100, Math.round((totals.subtotal / AppState.freeDeliveryThreshold) * 100));
            freeShippingProgress.style.width = `${pct}%`;
            freeShippingText.innerHTML = `Te faltan <strong>${formatPrice(remaining)}</strong> para conseguir <strong>Envío Gratis</strong>`;
        }
    }

    // Descuento UI
    const discountRow = document.getElementById('cart-discount-row');
    const discountEl = document.getElementById('cart-discount');
    if (totals.discountAmount > 0) {
        discountRow.classList.remove('hidden');
        discountEl.textContent = `-${formatPrice(totals.discountAmount)}`;
    } else {
        discountRow.classList.add('hidden');
    }

    document.getElementById('cart-total').textContent = formatPrice(totals.total);
}

function initCartDrawerListeners() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    const openBtns = document.querySelectorAll('.open-cart-btn');
    const closeBtn = document.getElementById('close-cart-btn');

    openBtns.forEach(btn => btn.addEventListener('click', openCartDrawer));
    if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
    if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

    // Botones de método de entrega (Retiro / Envío)
    const pickupRadio = document.getElementById('delivery-pickup');
    const shippingRadio = document.getElementById('delivery-shipping');

    if (pickupRadio && shippingRadio) {
        pickupRadio.addEventListener('change', () => {
            AppState.deliveryMethod = 'pickup';
            updateCartUI();
        });
        shippingRadio.addEventListener('change', () => {
            AppState.deliveryMethod = 'delivery';
            updateCartUI();
        });
    }

    // Cupón de descuento
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponInput = document.getElementById('coupon-code-input');
    const couponFeedback = document.getElementById('coupon-feedback');

    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim().toUpperCase();
            if (!code) return;

            if (AppState.validCoupons[code]) {
                AppState.appliedCoupon = code;
                couponFeedback.textContent = `✓ Cupón aplicado: ${AppState.validCoupons[code].label}`;
                couponFeedback.className = 'text-xs text-emerald-600 mt-1 block font-medium';
                showToast('¡Cupón Válido!', AppState.validCoupons[code].label, 'fa-tag', 'success');
                updateCartUI();
            } else {
                couponFeedback.textContent = '✕ Cupón inválido o expirado. Prueba con "DULCE10"';
                couponFeedback.className = 'text-xs text-red-500 mt-1 block';
            }
        });
    }

    // Botón de checkout por WhatsApp
    const checkoutBtn = document.getElementById('whatsapp-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', generateWhatsAppOrder);
    }
}

function openCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
        backdrop.classList.remove('hidden');
        setTimeout(() => {
            backdrop.classList.remove('opacity-0');
            drawer.classList.remove('translate-x-full');
        }, 10);
        document.body.style.overflow = 'hidden';
    }
}

function closeCartDrawer() {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-backdrop');
    if (drawer && backdrop) {
        drawer.classList.add('translate-x-full');
        backdrop.classList.add('opacity-0');
        setTimeout(() => {
            backdrop.classList.add('hidden');
            document.body.style.overflow = '';
        }, 300);
    }
}

function animateCartIcon() {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(b => {
        b.classList.add('scale-125');
        setTimeout(() => b.classList.remove('scale-125'), 200);
    });
}

function generateWhatsAppOrder() {
    if (AppState.cart.length === 0) {
        showToast('Carrito vacío', 'Añade productos antes de enviar el pedido', 'fa-triangle-exclamation', 'warning');
        return;
    }

    const totals = calculateCartTotals();
    const dateStr = new Date().toLocaleDateString('es-AR');

    let message = `🧁 *¡Hola Rico e Doce Bakery! Deseo realizar un pedido*\n`;
    message += `📅 *Fecha:* ${dateStr}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `🛍️ *DETALLE DEL PEDIDO:*\n\n`;

    AppState.cart.forEach((item, i) => {
        message += `*${i + 1}. ${item.name}* (x${item.quantity})\n`;
        if (item.type === 'custom') {
            message += `   📝 _Personalización:_ ${item.detailsSummary}\n`;
            if (item.dedication) {
                message += `   💌 _Dedicatoria:_ "${item.dedication}"\n`;
            }
        }
        message += `   💰 Subtotal: ${formatPrice(item.price * item.quantity)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💵 *Subtotal:* ${formatPrice(totals.subtotal)}\n`;

    if (totals.discountAmount > 0) {
        message += `🏷️ *Descuento (${AppState.appliedCoupon}):* -${formatPrice(totals.discountAmount)}\n`;
    }

    message += `🚚 *Método de Entrega:* ${AppState.deliveryMethod === 'pickup' ? 'Retiro por el Taller' : 'Envío a Domicilio'}\n`;
    if (AppState.deliveryMethod === 'delivery') {
        message += `📦 *Costo de envío:* ${totals.isFreeShipping ? '¡GRATIS!' : formatPrice(totals.shipping)}\n`;
    }

    message += `✨ *TOTAL A ABONAR: ${formatPrice(totals.total)}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `¿Me confirman disponibilidad y los datos de transferencia? ¡Muchas gracias! 💕`;

    // Número de demostración de la pastelería
    const phoneNumber = "5491123456789";
    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;

    window.open(whatsappUrl, '_blank');
}

// ==========================================================================
// PERSONALIZADOR DE TORTAS A MEDIDA
// ==========================================================================

function initCakeBuilder() {
    renderBuilderSizes();
    renderBuilderSponges();
    renderBuilderFillings();
    renderBuilderExtras();
    renderBuilderStyles();

    // Eventos inputs de texto
    const dedicationInput = document.getElementById('cake-dedication-text');
    const notesInput = document.getElementById('cake-special-notes');

    if (dedicationInput) {
        dedicationInput.addEventListener('input', (e) => {
            AppState.customCake.dedication = e.target.value;
            updateCustomCakeSummary();
        });
    }

    if (notesInput) {
        notesInput.addEventListener('input', (e) => {
            AppState.customCake.notes = e.target.value;
        });
    }

    // Botón agregar al carrito
    const addCustomBtn = document.getElementById('add-custom-cake-to-cart');
    if (addCustomBtn) {
        addCustomBtn.addEventListener('click', handleAddCustomCake);
    }

    updateCustomCakeSummary();
}

function renderBuilderSizes() {
    const container = document.getElementById('builder-sizes-container');
    if (!container) return;

    container.innerHTML = CUSTOM_CAKE_OPTIONS.sizes.map(size => `
        <div 
            class="builder-option-card p-4 rounded-xl border-2 bg-white transition-all ${AppState.customCake.size === size.id ? 'selected' : 'border-[#ECC0D6]'}"
            onclick="selectCakeOption('size', '${size.id}')"
        >
            <div class="flex items-center justify-between mb-1">
                <span class="font-bold text-sm text-[#22181F]">${size.name}</span>
                ${size.recommended ? `<span class="bg-[#D84C7B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Popular</span>` : ''}
            </div>
            <p class="text-xs text-[#825E73] mb-2">${size.weight}</p>
            <div class="font-serif-title font-bold text-[#D84C7B] text-base">
                ${formatPrice(size.price)}
            </div>
        </div>
    `).join('');
}

function renderBuilderSponges() {
    const container = document.getElementById('builder-sponges-container');
    if (!container) return;

    container.innerHTML = CUSTOM_CAKE_OPTIONS.sponges.map(sp => `
        <div 
            class="builder-option-card p-3 rounded-xl border-2 bg-white transition-all ${AppState.customCake.sponge === sp.id ? 'selected' : 'border-[#ECC0D6]'}"
            onclick="selectCakeOption('sponge', '${sp.id}')"
        >
            <div class="flex items-center justify-between">
                <span class="font-semibold text-xs text-[#22181F]">${sp.name}</span>
                <span class="text-xs font-medium ${sp.extra === 0 ? 'text-emerald-600' : 'text-[#825E73]'}">
                    ${sp.extra === 0 ? 'Incluido' : `+${formatPrice(sp.extra)}`}
                </span>
            </div>
            <p class="text-[11px] text-[#825E73] mt-0.5">${sp.desc}</p>
        </div>
    `).join('');
}

function renderBuilderFillings() {
    const container = document.getElementById('builder-fillings-container');
    if (!container) return;

    container.innerHTML = CUSTOM_CAKE_OPTIONS.fillings.map(fil => `
        <div 
            class="builder-option-card p-3 rounded-xl border-2 bg-white transition-all ${AppState.customCake.filling === fil.id ? 'selected' : 'border-[#ECC0D6]'}"
            onclick="selectCakeOption('filling', '${fil.id}')"
        >
            <div class="flex items-center justify-between">
                <span class="font-semibold text-xs text-[#22181F]">${fil.name}</span>
                <span class="text-xs font-medium ${fil.extra === 0 ? 'text-emerald-600' : 'text-[#825E73]'}">
                    ${fil.extra === 0 ? 'Incluido' : `+${formatPrice(fil.extra)}`}
                </span>
            </div>
            <p class="text-[11px] text-[#825E73] mt-0.5">${fil.desc}</p>
        </div>
    `).join('');
}

function renderBuilderExtras() {
    const container = document.getElementById('builder-extras-container');
    if (!container) return;

    container.innerHTML = CUSTOM_CAKE_OPTIONS.extras.map(ex => {
        const isChecked = AppState.customCake.extras.includes(ex.id);
        return `
            <label class="flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${isChecked ? 'border-[#D84C7B] bg-[#FFEDF6]' : 'border-[#ECC0D6] bg-white'}">
                <div class="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        ${isChecked ? 'checked' : ''} 
                        onchange="toggleCakeExtra('${ex.id}')"
                        class="accent-[#D84C7B] rounded w-4 h-4 cursor-pointer"
                    />
                    <span class="text-xs font-medium text-[#22181F]">${ex.name}</span>
                </div>
                <span class="text-xs font-semibold text-[#D84C7B]">+${formatPrice(ex.price)}</span>
            </label>
        `;
    }).join('');
}

function renderBuilderStyles() {
    const container = document.getElementById('builder-styles-container');
    if (!container) return;

    container.innerHTML = CUSTOM_CAKE_OPTIONS.styles.map(st => `
        <div 
            class="builder-option-card p-3 rounded-xl border-2 bg-white transition-all ${AppState.customCake.style === st.id ? 'selected' : 'border-[#ECC0D6]'}"
            onclick="selectCakeOption('style', '${st.id}')"
        >
            <div class="flex items-center justify-between">
                <span class="font-semibold text-xs text-[#22181F]">${st.name}</span>
                <span class="text-xs font-medium text-[#825E73]">+${formatPrice(st.extra)}</span>
            </div>
            <p class="text-[11px] text-[#825E73] mt-0.5">${st.desc}</p>
        </div>
    `).join('');
}

function selectCakeOption(type, id) {
    AppState.customCake[type] = id;
    if (type === 'size') renderBuilderSizes();
    if (type === 'sponge') renderBuilderSponges();
    if (type === 'filling') renderBuilderFillings();
    if (type === 'style') renderBuilderStyles();
    updateCustomCakeSummary();
}

function toggleCakeExtra(extraId) {
    const idx = AppState.customCake.extras.indexOf(extraId);
    if (idx > -1) {
        AppState.customCake.extras.splice(idx, 1);
    } else {
        AppState.customCake.extras.push(extraId);
    }
    renderBuilderExtras();
    updateCustomCakeSummary();
}

function calculateCustomCakePrice() {
    const sizeObj = CUSTOM_CAKE_OPTIONS.sizes.find(s => s.id === AppState.customCake.size) || CUSTOM_CAKE_OPTIONS.sizes[0];
    const spongeObj = CUSTOM_CAKE_OPTIONS.sponges.find(s => s.id === AppState.customCake.sponge) || CUSTOM_CAKE_OPTIONS.sponges[0];
    const fillingObj = CUSTOM_CAKE_OPTIONS.fillings.find(f => f.id === AppState.customCake.filling) || CUSTOM_CAKE_OPTIONS.fillings[0];
    const styleObj = CUSTOM_CAKE_OPTIONS.styles.find(s => s.id === AppState.customCake.style) || CUSTOM_CAKE_OPTIONS.styles[0];

    let extrasTotal = 0;
    AppState.customCake.extras.forEach(id => {
        const extraObj = CUSTOM_CAKE_OPTIONS.extras.find(e => e.id === id);
        if (extraObj) extrasTotal += extraObj.price;
    });

    const total = sizeObj.price + spongeObj.extra + fillingObj.extra + styleObj.extra + extrasTotal;

    return {
        total,
        sizeObj,
        spongeObj,
        fillingObj,
        styleObj,
        extrasTotal
    };
}

function updateCustomCakeSummary() {
    const calc = calculateCustomCakePrice();

    document.getElementById('custom-cake-total-price').textContent = formatPrice(calc.total);
    document.getElementById('summary-size-val').textContent = `${calc.sizeObj.name} (${calc.sizeObj.weight})`;
    document.getElementById('summary-sponge-val').textContent = calc.spongeObj.name;
    document.getElementById('summary-filling-val').textContent = calc.fillingObj.name;
    document.getElementById('summary-style-val').textContent = calc.styleObj.name;

    const extrasNames = AppState.customCake.extras
        .map(id => CUSTOM_CAKE_OPTIONS.extras.find(e => e.id === id)?.name)
        .filter(Boolean);
    
    document.getElementById('summary-extras-val').textContent = extrasNames.length > 0 ? extrasNames.join(', ') : 'Sin agregados extra';

    const dedicationEl = document.getElementById('summary-dedication-val');
    if (dedicationEl) {
        dedicationEl.textContent = AppState.customCake.dedication ? `"${AppState.customCake.dedication}"` : 'Sin dedicatoria';
    }
}

function handleAddCustomCake() {
    const calc = calculateCustomCakePrice();
    const extrasList = AppState.customCake.extras
        .map(id => CUSTOM_CAKE_OPTIONS.extras.find(e => e.id === id)?.name)
        .filter(Boolean);

    const summaryText = `${calc.sizeObj.name} | ${calc.spongeObj.name} + ${calc.fillingObj.name} | Estilo: ${calc.styleObj.name}${extrasList.length ? ' | Extras: ' + extrasList.join(', ') : ''}`;

    const customItem = {
        id: `custom-cake-${Date.now()}`,
        name: `Torta Personalizada Rico e Doce`,
        price: calc.total,
        quantity: 1,
        image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80",
        type: 'custom',
        detailsSummary: summaryText,
        dedication: AppState.customCake.dedication,
        notes: AppState.customCake.notes
    };

    addCustomCakeToCart(customItem);
}

// ==========================================================================
// TOAST NOTIFICATIONS
// ==========================================================================

function showToast(title, message, icon = 'fa-check', type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const borderColors = {
        success: 'border-emerald-500 bg-white text-[#22181F]',
        info: 'border-blue-500 bg-white text-[#22181F]',
        warning: 'border-amber-500 bg-white text-[#22181F]'
    };

    const iconColors = {
        success: 'text-emerald-500',
        info: 'text-blue-500',
        warning: 'text-amber-500'
    };

    toast.className = `toast flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-xl max-w-sm pointer-events-auto ${borderColors[type] || borderColors.success}`;
    toast.innerHTML = `
        <div class="mt-0.5 text-lg ${iconColors[type] || 'text-[#D84C7B]'}">
            <i class="fa-solid ${icon}"></i>
        </div>
        <div class="flex-1">
            <h5 class="text-xs font-bold uppercase tracking-wider text-[#9C7F90]">${title}</h5>
            <p class="text-xs font-semibold text-[#22181F] mt-0.5 leading-snug">${message}</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 text-xs p-1" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ==========================================================================
// FAQ ACCORDION
// ==========================================================================

function initFaqAccordion() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
        const header = item.querySelector('.faq-header');
        const content = item.querySelector('.faq-content');
        const icon = item.querySelector('.faq-icon');

        if (header && content && icon) {
            header.addEventListener('click', () => {
                const isOpen = !content.classList.contains('hidden');

                // Cerrar todos los demás
                items.forEach(other => {
                    other.querySelector('.faq-content')?.classList.add('hidden');
                    other.querySelector('.faq-icon')?.classList.remove('rotate-180');
                });

                if (!isOpen) {
                    content.classList.remove('hidden');
                    icon.classList.add('rotate-180');
                }
            });
        }
    });
}

// ==========================================================================
// NAVEGACIÓN MÓVIL
// ==========================================================================

function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (toggleBtn && mobileMenu) {
        toggleBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}
