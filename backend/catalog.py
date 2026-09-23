"""Glowmatch in-memory product catalog seed (~80 produits)."""
from typing import List, Dict, Any
import uuid

# Helper for stable ids
def _id(seed: str) -> str:
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"glowmatch-{seed}"))

CATALOG: List[Dict[str, Any]] = [
    # ===== VISAGE - Crème hydratante =====
    {"id": _id("cr1"), "category": "creme-hydratante", "parent": "visage", "name": "Hydra-Glow Crème Légère", "brand": "Lumière Paris", "price": 18.90, "rating": 4.6, "reviews": 1240, "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", "tags": ["Hydratation", "Acide hyaluronique", "Vegan"], "skin_types": ["mixte", "grasse", "normale"], "benefits": ["Hydratation intense", "Éclat"], "affiliate_url": "#"},
    {"id": _id("cr2"), "category": "creme-hydratante", "parent": "visage", "name": "Rich Repair Cream", "brand": "Botanique", "price": 32.00, "rating": 4.8, "reviews": 890, "image": "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", "tags": ["Nourrissante", "Sans paraben", "Cruelty-free"], "skin_types": ["sèche", "mature", "sensible"], "benefits": ["Anti-âge", "Réparateur"], "affiliate_url": "#"},
    {"id": _id("cr3"), "category": "creme-hydratante", "parent": "visage", "name": "Matte Balance Gel", "brand": "Pure Skin", "price": 14.50, "rating": 4.3, "reviews": 2104, "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600", "tags": ["Matifiant", "Niacinamide", "Sans huile"], "skin_types": ["grasse", "acnéique"], "benefits": ["Matifiant"], "affiliate_url": "#"},
    {"id": _id("cr4"), "category": "creme-hydratante", "parent": "visage", "name": "Bio Aqua Velvet", "brand": "Verveine", "price": 26.00, "rating": 4.7, "reviews": 540, "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600", "tags": ["Bio", "Vegan", "Sans silicone"], "skin_types": ["sensible", "normale"], "benefits": ["Apaisant", "Hydratation intense"], "affiliate_url": "#"},
    {"id": _id("cr5"), "category": "creme-hydratante", "parent": "visage", "name": "Solar Shield SPF50", "brand": "Lumière Paris", "price": 22.00, "rating": 4.5, "reviews": 1340, "image": "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=600", "tags": ["SPF50", "Protecteur"], "skin_types": ["normale", "sensible"], "benefits": ["Protecteur (SPF)"], "affiliate_url": "#"},

    # ===== VISAGE - Sérum =====
    {"id": _id("se1"), "category": "serum", "parent": "visage", "name": "Niacinamide 10 Booster", "brand": "Pure Lab", "price": 12.90, "rating": 4.7, "reviews": 3120, "image": "https://images.unsplash.com/photo-1620916297893-9c8d3e3a3d4f?w=600", "tags": ["Niacinamide", "Pores", "Vegan"], "skin_types": ["grasse", "mixte"], "benefits": ["Anti-taches", "Matifiant"], "affiliate_url": "#"},
    {"id": _id("se2"), "category": "serum", "parent": "visage", "name": "Acide Hyaluronique Pur", "brand": "Botanique", "price": 19.00, "rating": 4.8, "reviews": 2450, "image": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600", "tags": ["Acide hyaluronique", "Hydratation"], "skin_types": ["sèche", "normale", "mature"], "benefits": ["Hydratation intense"], "affiliate_url": "#"},
    {"id": _id("se3"), "category": "serum", "parent": "visage", "name": "Vitamine C Glow", "brand": "Lumière Paris", "price": 28.50, "rating": 4.6, "reviews": 1820, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Vitamine C", "Éclat", "Anti-taches"], "skin_types": ["mixte", "normale"], "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},
    {"id": _id("se4"), "category": "serum", "parent": "visage", "name": "Retinol Night Repair", "brand": "Skinology", "price": 38.00, "rating": 4.5, "reviews": 970, "image": "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600", "tags": ["Rétinol", "Anti-âge"], "skin_types": ["mature", "normale"], "benefits": ["Anti-âge"], "affiliate_url": "#"},
    {"id": _id("se5"), "category": "serum", "parent": "visage", "name": "Calm-CBD Soothing Serum", "brand": "Verveine", "price": 34.00, "rating": 4.7, "reviews": 410, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["CBD", "Apaisant", "Sans parfum"], "skin_types": ["sensible"], "benefits": ["Apaisant"], "affiliate_url": "#"},

    # ===== VISAGE - Nettoyant =====
    {"id": _id("ne1"), "category": "nettoyant", "parent": "visage", "name": "Gel Mousse Pureté", "brand": "Pure Skin", "price": 9.90, "rating": 4.4, "reviews": 1820, "image": "https://images.unsplash.com/photo-1556228841-7a36cee37b30?w=600", "tags": ["Sans paraben", "Doux"], "skin_types": ["grasse", "mixte"], "benefits": ["Matifiant"], "affiliate_url": "#"},
    {"id": _id("ne2"), "category": "nettoyant", "parent": "visage", "name": "Lait Démaquillant Velours", "brand": "Botanique", "price": 16.50, "rating": 4.7, "reviews": 920, "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600", "tags": ["Nourrissante", "Sans parfum"], "skin_types": ["sèche", "sensible"], "benefits": ["Apaisant"], "affiliate_url": "#"},
    {"id": _id("ne3"), "category": "nettoyant", "parent": "visage", "name": "Huile Démaquillante Pure", "brand": "Verveine", "price": 24.00, "rating": 4.8, "reviews": 1340, "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", "tags": ["Huile", "Vegan", "Bio"], "skin_types": ["mixte", "sèche"], "benefits": ["Hydratation intense"], "affiliate_url": "#"},

    # ===== VISAGE - Masque =====
    {"id": _id("ma1"), "category": "masque", "parent": "visage", "name": "Clay Detox Masque", "brand": "Pure Lab", "price": 15.00, "rating": 4.5, "reviews": 760, "image": "https://images.unsplash.com/photo-1612886623306-c8b6f6a8aaa9?w=600", "tags": ["Argile", "Pores", "Matifiant"], "skin_types": ["grasse", "mixte"], "benefits": ["Matifiant"], "affiliate_url": "#"},
    {"id": _id("ma2"), "category": "masque", "parent": "visage", "name": "Glow Sheet Masque x5", "brand": "Lumière Paris", "price": 12.00, "rating": 4.4, "reviews": 410, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Hydratation", "Éclat"], "skin_types": ["normale", "sèche"], "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},

    # ===== VISAGE - Contour des yeux =====
    {"id": _id("yx1"), "category": "contour-yeux", "parent": "visage", "name": "Eye Lift Caféine", "brand": "Skinology", "price": 22.00, "rating": 4.6, "reviews": 1120, "image": "https://images.unsplash.com/photo-1620916297897-9c8d3e3a3d4f?w=600", "tags": ["Caféine", "Anti-cernes"], "skin_types": ["normale", "mature"], "benefits": ["Anti-âge"], "affiliate_url": "#"},
    {"id": _id("yx2"), "category": "contour-yeux", "parent": "visage", "name": "Roll-On Fraîcheur", "brand": "Verveine", "price": 18.00, "rating": 4.3, "reviews": 540, "image": "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=600", "tags": ["Décongestionnant"], "skin_types": ["sensible", "normale"], "benefits": ["Apaisant"], "affiliate_url": "#"},

    # ===== VISAGE - Soin lèvres =====
    {"id": _id("lv1"), "category": "soin-levres", "parent": "visage", "name": "Baume Lèvres Karité", "brand": "Botanique", "price": 7.50, "rating": 4.7, "reviews": 2410, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["Karité", "Bio"], "skin_types": ["sèche", "sensible"], "benefits": ["Réparateur"], "affiliate_url": "#"},

    # ===== VISAGE - Fond de teint / BB =====
    {"id": _id("ft1"), "category": "fond-de-teint", "parent": "visage", "name": "Skin Tint Lumière", "brand": "Lumière Paris", "price": 29.00, "rating": 4.5, "reviews": 1820, "image": "https://images.unsplash.com/photo-1620051603687-bc4ba18f1e29?w=600", "tags": ["Naturel", "SPF15"], "skin_types": ["mixte", "normale"], "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},
    {"id": _id("ft2"), "category": "fond-de-teint", "parent": "visage", "name": "BB Cream Velvet", "brand": "Pure Skin", "price": 17.90, "rating": 4.3, "reviews": 940, "image": "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600", "tags": ["Matifiant", "Couvrance moyenne"], "skin_types": ["grasse", "mixte"], "benefits": ["Matifiant"], "affiliate_url": "#"},

    # ===== CORPS - Crème corps =====
    {"id": _id("co1"), "category": "creme-corps", "parent": "corps", "name": "Lait Corps Karité", "brand": "Botanique", "price": 16.00, "rating": 4.6, "reviews": 1340, "image": "https://images.unsplash.com/photo-1556228579-1c5c0c0a7888?w=600", "tags": ["Karité", "Nourrissante", "Bio"], "skin_types": ["sèche"], "benefits": ["Hydratation intense"], "affiliate_url": "#"},
    {"id": _id("co2"), "category": "creme-corps", "parent": "corps", "name": "Body Glow Oil", "brand": "Lumière Paris", "price": 24.00, "rating": 4.7, "reviews": 820, "image": "https://images.unsplash.com/photo-1571781565036-d3f759be73e4?w=600", "tags": ["Huile", "Vegan", "Éclat"], "skin_types": ["normale", "sèche"], "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},
    {"id": _id("co3"), "category": "creme-corps", "parent": "corps", "name": "Stretch Repair Beurre", "brand": "Verveine", "price": 32.00, "rating": 4.8, "reviews": 410, "image": "https://images.unsplash.com/photo-1597854407429-d10e64083c92?w=600", "tags": ["Vergetures", "Beurre"], "skin_types": ["sèche", "sensible"], "benefits": ["Réparateur"], "affiliate_url": "#"},

    # ===== CORPS - Gommage =====
    {"id": _id("gg1"), "category": "gommage-corps", "parent": "corps", "name": "Sugar Scrub Vanille", "brand": "Botanique", "price": 19.00, "rating": 4.5, "reviews": 540, "image": "https://images.unsplash.com/photo-1556228841-7a36cee37b30?w=600", "tags": ["Sucre", "Vegan"], "skin_types": ["normale"], "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},

    # ===== CORPS - Soin mains =====
    {"id": _id("mn1"), "category": "soin-mains", "parent": "corps", "name": "Crème Mains Réparatrice", "brand": "Verveine", "price": 11.00, "rating": 4.7, "reviews": 1240, "image": "https://images.unsplash.com/photo-1620916297897-9c8d3e3a3d4f?w=600", "tags": ["Karité", "Bio"], "skin_types": ["sèche", "sensible"], "benefits": ["Réparateur"], "affiliate_url": "#"},

    # ===== CORPS - Solaire =====
    {"id": _id("ss1"), "category": "creme-solaire-corps", "parent": "corps", "name": "Sun Velvet SPF50+", "brand": "Lumière Paris", "price": 26.00, "rating": 4.6, "reviews": 920, "image": "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=600", "tags": ["SPF50+", "Vegan"], "skin_types": ["normale", "sensible"], "benefits": ["Protecteur (SPF)"], "affiliate_url": "#"},

    # ===== CORPS - Gel douche =====
    {"id": _id("gd1"), "category": "gel-douche", "parent": "corps", "name": "Mousse Douche Florale", "brand": "Botanique", "price": 8.50, "rating": 4.4, "reviews": 1820, "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", "tags": ["Doux", "Sans paraben"], "skin_types": ["normale", "sensible"], "benefits": ["Apaisant"], "affiliate_url": "#"},

    # ===== CORPS - Déodorant =====
    {"id": _id("de1"), "category": "deodorant", "parent": "corps", "name": "Déo Naturel 24h", "brand": "Pure Skin", "price": 9.00, "rating": 4.3, "reviews": 740, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Sans aluminium", "Bio"], "skin_types": ["sensible", "normale"], "benefits": ["Apaisant"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Rouge à lèvres =====
    {"id": _id("rl1"), "category": "rouge-a-levres", "parent": "cosmetiques", "name": "Velvet Matte Lipstick Rosewood", "brand": "Maison Rouge", "price": 22.00, "rating": 4.6, "reviews": 1820, "image": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600", "tags": ["Mat", "Longue tenue"], "color_hex": "#A85060", "zone": "lips", "benefits": ["Lèvres intenses"], "affiliate_url": "#"},
    {"id": _id("rl2"), "category": "rouge-a-levres", "parent": "cosmetiques", "name": "Glossy Nude Honey", "brand": "Lumière Paris", "price": 18.00, "rating": 4.5, "reviews": 1240, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["Gloss", "Nude"], "color_hex": "#C68D78", "zone": "lips", "benefits": ["Nude & naturel"], "affiliate_url": "#"},
    {"id": _id("rl3"), "category": "rouge-a-levres", "parent": "cosmetiques", "name": "Bold Red Statement", "brand": "Maison Rouge", "price": 24.00, "rating": 4.7, "reviews": 940, "image": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600", "tags": ["Rouge", "Intense"], "color_hex": "#B22234", "zone": "lips", "benefits": ["Lèvres intenses"], "affiliate_url": "#"},
    {"id": _id("rl4"), "category": "rouge-a-levres", "parent": "cosmetiques", "name": "Terracotta Lip Crayon", "brand": "Pure Skin", "price": 15.50, "rating": 4.4, "reviews": 540, "image": "https://images.unsplash.com/photo-1631214540514-2f3a3b8c1571?w=600", "tags": ["Terracotta", "Crémeux"], "color_hex": "#B5634A", "zone": "lips", "benefits": ["Look terracotta"], "affiliate_url": "#"},
    {"id": _id("rl5"), "category": "rouge-a-levres", "parent": "cosmetiques", "name": "Prune Velvet Lip", "brand": "Skinology", "price": 21.00, "rating": 4.5, "reviews": 380, "image": "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600", "tags": ["Prune", "Mat"], "color_hex": "#7A3B5C", "zone": "lips", "benefits": ["Prune & mauve"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Fond de teint =====
    {"id": _id("fd1"), "category": "fond-de-teint-cosmetique", "parent": "cosmetiques", "name": "Luminous Foundation N3", "brand": "Lumière Paris", "price": 36.00, "rating": 4.7, "reviews": 1340, "image": "https://images.unsplash.com/photo-1620051603687-bc4ba18f1e29?w=600", "tags": ["Lumineux", "Longue tenue"], "color_hex": "#E2BFA0", "zone": "face", "benefits": ["Teint unifié"], "affiliate_url": "#"},
    {"id": _id("fd2"), "category": "fond-de-teint-cosmetique", "parent": "cosmetiques", "name": "Matte Stay Foundation N4", "brand": "Maison Rouge", "price": 28.00, "rating": 4.5, "reviews": 920, "image": "https://images.unsplash.com/photo-1631730486572-226d1f595b68?w=600", "tags": ["Mat", "Couvrant"], "color_hex": "#D2A07A", "zone": "face", "benefits": ["Matifiant"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Palette yeux =====
    {"id": _id("py1"), "category": "palette-yeux", "parent": "cosmetiques", "name": "Terracotta Sunset Palette", "brand": "Maison Rouge", "price": 42.00, "rating": 4.8, "reviews": 1820, "image": "https://images.unsplash.com/photo-1583241800698-9c2e89ccfa4d?w=600", "tags": ["Terracotta", "9 teintes"], "color_hex": "#B5634A", "zone": "eyes", "benefits": ["Look terracotta"], "affiliate_url": "#"},
    {"id": _id("py2"), "category": "palette-yeux", "parent": "cosmetiques", "name": "Nude Essentials Palette", "brand": "Lumière Paris", "price": 38.00, "rating": 4.7, "reviews": 1240, "image": "https://images.unsplash.com/photo-1583241475880-083f84372725?w=600", "tags": ["Nude", "12 teintes"], "color_hex": "#C9A88A", "zone": "eyes", "benefits": ["Nude & naturel"], "affiliate_url": "#"},
    {"id": _id("py3"), "category": "palette-yeux", "parent": "cosmetiques", "name": "Smoky Night Palette", "brand": "Skinology", "price": 34.00, "rating": 4.5, "reviews": 760, "image": "https://images.unsplash.com/photo-1583241935544-cb16de60c9a0?w=600", "tags": ["Smoky", "Mat & shimmer"], "color_hex": "#3B2B2B", "zone": "eyes", "benefits": ["Smoky dramatique"], "affiliate_url": "#"},
    {"id": _id("py4"), "category": "palette-yeux", "parent": "cosmetiques", "name": "Plum Mauve Palette", "brand": "Maison Rouge", "price": 40.00, "rating": 4.6, "reviews": 540, "image": "https://images.unsplash.com/photo-1583241801069-5f1497e3ae0a?w=600", "tags": ["Prune", "Mauve"], "color_hex": "#7A3B5C", "zone": "eyes", "benefits": ["Prune & mauve"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Mascara =====
    {"id": _id("ms1"), "category": "mascara", "parent": "cosmetiques", "name": "Volume Black Mascara", "brand": "Maison Rouge", "price": 18.00, "rating": 4.7, "reviews": 2410, "image": "https://images.unsplash.com/photo-1631214540514-2f3a3b8c1571?w=600", "tags": ["Volume", "Waterproof"], "color_hex": "#0A0A0A", "zone": "eyes", "benefits": ["Yeux intenses"], "affiliate_url": "#"},
    {"id": _id("ms2"), "category": "mascara", "parent": "cosmetiques", "name": "Natural Lash Mascara", "brand": "Pure Skin", "price": 14.00, "rating": 4.4, "reviews": 1120, "image": "https://images.unsplash.com/photo-1631214540514-2f3a3b8c1571?w=600", "tags": ["Naturel", "Vegan"], "color_hex": "#1A1A1A", "zone": "eyes", "benefits": ["Nude & naturel"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Eyeliner =====
    {"id": _id("el1"), "category": "eyeliner", "parent": "cosmetiques", "name": "Liquid Eyeliner Precision", "brand": "Maison Rouge", "price": 16.00, "rating": 4.6, "reviews": 1340, "image": "https://images.unsplash.com/photo-1583241935544-cb16de60c9a0?w=600", "tags": ["Liquide", "Longue tenue"], "color_hex": "#0A0A0A", "zone": "eyes", "benefits": ["Yeux intenses"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Blush =====
    {"id": _id("bl1"), "category": "blush", "parent": "cosmetiques", "name": "Peach Glow Blush", "brand": "Lumière Paris", "price": 24.00, "rating": 4.7, "reviews": 1620, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["Pêche", "Naturel"], "color_hex": "#F2A48A", "zone": "cheeks", "benefits": ["Effet bonne mine"], "affiliate_url": "#"},
    {"id": _id("bl2"), "category": "blush", "parent": "cosmetiques", "name": "Rose Pink Blush", "brand": "Maison Rouge", "price": 22.00, "rating": 4.5, "reviews": 920, "image": "https://images.unsplash.com/photo-1612886623306-c8b6f6a8aaa9?w=600", "tags": ["Rose", "Poudre"], "color_hex": "#F0A2B0", "zone": "cheeks", "benefits": ["Nude & naturel"], "affiliate_url": "#"},
    {"id": _id("bl3"), "category": "blush", "parent": "cosmetiques", "name": "Terracotta Cream Blush", "brand": "Skinology", "price": 20.00, "rating": 4.6, "reviews": 540, "image": "https://images.unsplash.com/photo-1583241801069-5f1497e3ae0a?w=600", "tags": ["Crème", "Terracotta"], "color_hex": "#C26A4F", "zone": "cheeks", "benefits": ["Look terracotta"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Highlighter =====
    {"id": _id("hl1"), "category": "highlighter", "parent": "cosmetiques", "name": "Champagne Glow Highlighter", "brand": "Lumière Paris", "price": 28.00, "rating": 4.8, "reviews": 1240, "image": "https://images.unsplash.com/photo-1620051603687-bc4ba18f1e29?w=600", "tags": ["Champagne", "Poudre"], "color_hex": "#F4DDB8", "zone": "cheeks", "benefits": ["Éclat"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Poudre =====
    {"id": _id("pd1"), "category": "poudre", "parent": "cosmetiques", "name": "Setting Powder Translucent", "brand": "Pure Skin", "price": 19.00, "rating": 4.5, "reviews": 1820, "image": "https://images.unsplash.com/photo-1626947346165-4c2288dadc2a?w=600", "tags": ["Translucide", "Fixante"], "color_hex": "#F2E5D5", "zone": "face", "benefits": ["Matifiant"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Sourcils =====
    {"id": _id("sc1"), "category": "sourcils", "parent": "cosmetiques", "name": "Brow Pomade Brunette", "brand": "Maison Rouge", "price": 17.00, "rating": 4.6, "reviews": 740, "image": "https://images.unsplash.com/photo-1583241935544-cb16de60c9a0?w=600", "tags": ["Pommade", "Longue tenue"], "color_hex": "#5A3D2B", "zone": "eyes", "benefits": ["Sourcils structurés"], "affiliate_url": "#"},

    # ===== COSMÉTIQUES - Primer =====
    {"id": _id("pr1"), "category": "primer", "parent": "cosmetiques", "name": "Smooth Base Primer", "brand": "Lumière Paris", "price": 26.00, "rating": 4.6, "reviews": 840, "image": "https://images.unsplash.com/photo-1620916297897-9c8d3e3a3d4f?w=600", "tags": ["Lissant", "Hydratant"], "color_hex": "#F4E5D5", "zone": "face", "benefits": ["Éclat & teint unifié"], "affiliate_url": "#"},

    # ===== CHEVEUX - Shampoing =====
    {"id": _id("sh1"), "category": "shampoing", "parent": "cheveux", "name": "Pureté Douce Shampoing", "brand": "Botanique", "price": 14.90, "rating": 4.5, "reviews": 1240, "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", "tags": ["Sans sulfate", "Doux", "Vegan"], "hair_types": ["normaux", "fins", "ondulés"], "benefits": ["Nettoyage doux", "Volume"], "affiliate_url": "#"},
    {"id": _id("sh2"), "category": "shampoing", "parent": "cheveux", "name": "Anti-Pelliculaire Zinc", "brand": "Pure Lab", "price": 12.00, "rating": 4.6, "reviews": 920, "image": "https://images.unsplash.com/photo-1556228841-7a36cee37b30?w=600", "tags": ["Antipelliculaire", "Zinc"], "hair_types": ["gras", "normaux"], "benefits": ["Antipelliculaire", "Cuir chevelu assaini"], "affiliate_url": "#"},
    {"id": _id("sh3"), "category": "shampoing", "parent": "cheveux", "name": "Nutrition Intense Argan", "brand": "Verveine", "price": 18.50, "rating": 4.7, "reviews": 760, "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600", "tags": ["Huile d'argan", "Nourrissante", "Sans silicone"], "hair_types": ["secs", "crépus", "bouclés", "frisés"], "benefits": ["Nutrition intense", "Réparateur"], "affiliate_url": "#"},
    {"id": _id("sh4"), "category": "shampoing", "parent": "cheveux", "name": "Volume Boost Shampoing", "brand": "Lumière Paris", "price": 16.00, "rating": 4.4, "reviews": 540, "image": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", "tags": ["Volume", "Légèreté"], "hair_types": ["fins", "normaux", "raides"], "benefits": ["Volume", "Légèreté"], "affiliate_url": "#"},

    # ===== CHEVEUX - Après-shampoing =====
    {"id": _id("as1"), "category": "apres-shampoing", "parent": "cheveux", "name": "Démêlant Karité Onctueux", "brand": "Botanique", "price": 16.90, "rating": 4.6, "reviews": 890, "image": "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", "tags": ["Karité", "Démêlant", "Vegan"], "hair_types": ["secs", "crépus", "bouclés", "frisés"], "benefits": ["Démêlant", "Nutrition intense"], "affiliate_url": "#"},
    {"id": _id("as2"), "category": "apres-shampoing", "parent": "cheveux", "name": "Légèreté & Volume", "brand": "Pure Skin", "price": 13.50, "rating": 4.4, "reviews": 1120, "image": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600", "tags": ["Volume", "Légèreté", "Sans silicone"], "hair_types": ["fins", "normaux", "raides"], "benefits": ["Volume", "Légèreté"], "affiliate_url": "#"},

    # ===== CHEVEUX - Masque =====
    {"id": _id("mch1"), "category": "masque-cheveux", "parent": "cheveux", "name": "Masque Reconstituant Kératine", "brand": "Skinology", "price": 24.00, "rating": 4.8, "reviews": 1340, "image": "https://images.unsplash.com/photo-1612886623306-c8b6f6a8aaa9?w=600", "tags": ["Kératine", "Réparateur", "Anti-casse"], "hair_types": ["abîmés", "secs", "colorés"], "benefits": ["Réparateur", "Anti-casse", "Brillance"], "affiliate_url": "#"},
    {"id": _id("mch2"), "category": "masque-cheveux", "parent": "cheveux", "name": "Masque Hydratant Aloe Vera", "brand": "Verveine", "price": 19.00, "rating": 4.6, "reviews": 720, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Aloe vera", "Hydratation", "Douceur"], "hair_types": ["secs", "normaux", "ondulés", "bouclés"], "benefits": ["Hydratation intense", "Douceur"], "affiliate_url": "#"},

    # ===== CHEVEUX - Huile =====
    {"id": _id("hch1"), "category": "huile-cheveux", "parent": "cheveux", "name": "Huile Précieuse Argan Coco", "brand": "Verveine", "price": 22.00, "rating": 4.7, "reviews": 1820, "image": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600", "tags": ["Huile d'argan", "Coco", "Brillance"], "hair_types": ["secs", "crépus", "bouclés", "frisés", "colorés"], "benefits": ["Brillance", "Nutrition intense", "Anti-frisottis"], "affiliate_url": "#"},
    {"id": _id("hch2"), "category": "huile-cheveux", "parent": "cheveux", "name": "Huile Légère Protect & Shine", "brand": "Lumière Paris", "price": 19.50, "rating": 4.5, "reviews": 640, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["Légère", "Protecteur", "Brillance"], "hair_types": ["normaux", "fins", "raides", "ondulés"], "benefits": ["Brillance", "Protection chaleur"], "affiliate_url": "#"},

    # ===== CHEVEUX - Sérum =====
    {"id": _id("sch1"), "category": "serum-cheveux", "parent": "cheveux", "name": "Sérum Anti-Chute Biotine", "brand": "Pure Lab", "price": 28.00, "rating": 4.6, "reviews": 970, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Biotine", "Anti-chute", "Fortifiant"], "hair_types": ["fins", "normaux", "raides", "ondulés"], "benefits": ["Anti-chute", "Fortifiant", "Volume"], "affiliate_url": "#"},
    {"id": _id("sch2"), "category": "serum-cheveux", "parent": "cheveux", "name": "Sérum Pointes Fourchues", "brand": "Botanique", "price": 21.00, "rating": 4.5, "reviews": 480, "image": "https://images.unsplash.com/photo-1620916297893-9c8d3e3a3d4f?w=600", "tags": ["Pointes", "Réparateur", "Kératine"], "hair_types": ["secs", "abîmés", "colorés", "bouclés", "frisés", "crépus"], "benefits": ["Réparateur", "Anti-casse", "Pointes soignées"], "affiliate_url": "#"},

    # ===== CHEVEUX - Spray coiffant =====
    {"id": _id("sp1"), "category": "spray-coiffant", "parent": "cheveux", "name": "Spray Thermoprotecteur 230°", "brand": "Skinology", "price": 17.00, "rating": 4.5, "reviews": 1120, "image": "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600", "tags": ["Thermoprotecteur", "Protection chaleur"], "hair_types": ["normaux", "secs", "fins", "raides", "ondulés"], "benefits": ["Protection chaleur", "Brillance"], "affiliate_url": "#"},

    # ===== CHEVEUX - Shampoing sec =====
    {"id": _id("shs1"), "category": "shampoing-sec", "parent": "cheveux", "name": "Shampoing Sec Fraîcheur Instantanée", "brand": "Pure Skin", "price": 11.00, "rating": 4.3, "reviews": 1540, "image": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600", "tags": ["Shampoing sec", "Volume", "Rapidité"], "hair_types": ["gras", "normaux", "fins"], "benefits": ["Volume", "Fraîcheur"], "affiliate_url": "#"},

    # ===== CHEVEUX - Soin anti-chute =====
    {"id": _id("sac1"), "category": "soin-anti-chute", "parent": "cheveux", "name": "Fortifiant Anti-Chute Global", "brand": "Pure Lab", "price": 32.00, "rating": 4.7, "reviews": 840, "image": "https://images.unsplash.com/photo-1599733589046-9a45fa7c7ddb?w=600", "tags": ["Anti-chute", "Biotine", "Fortifiant"], "hair_types": ["fins", "normaux", "raides", "ondulés"], "benefits": ["Anti-chute", "Fortifiant", "Volume"], "affiliate_url": "#"},

    # ===== CHEVEUX - Soin cheveux colorés =====
    {"id": _id("scc1"), "category": "soin-cheveux-colores", "parent": "cheveux", "name": "Protège Couleur Éclat", "brand": "Lumière Paris", "price": 26.00, "rating": 4.6, "reviews": 620, "image": "https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600", "tags": ["Cheveux colorés", "Protecteur couleur", "Brillance"], "hair_types": ["colorés", "secs", "abîmés"], "benefits": ["Brillance", "Protection couleur", "Réparateur"], "affiliate_url": "#"},

    # ===== CHEVEUX - Soin cuir chevelu =====
    {"id": _id("scu1"), "category": "soin-cuir-chevelu", "parent": "cheveux", "name": "Équilibre Cuir Chevelu Gras", "brand": "Pure Lab", "price": 20.00, "rating": 4.5, "reviews": 760, "image": "https://images.unsplash.com/photo-1556228841-7a36cee37b30?w=600", "tags": ["Cuir chevelu", "Sébo-régulateur", "Zinc"], "hair_types": ["gras", "normaux"], "benefits": ["Sébo-régulateur", "Antipelliculaire", "Cuir chevelu assaini"], "affiliate_url": "#"},
    {"id": _id("scu2"), "category": "soin-cuir-chevelu", "parent": "cheveux", "name": "Apaisant Cuir Chevelu Sensible", "brand": "Verveine", "price": 23.00, "rating": 4.7, "reviews": 480, "image": "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600", "tags": ["Apaisant", "Sans parfum", "Sensible"], "hair_types": ["sensibles", "secs", "normaux"], "benefits": ["Apaisant", "Douceur", "Cuir chevelu apaisé"], "affiliate_url": "#"},
]

# Categories tree for menu
CATEGORIES = {
    "visage": {
        "label": "Visage",
        "products": [
            {"slug": "creme-hydratante", "label": "Crème hydratante"},
            {"slug": "serum", "label": "Sérum"},
            {"slug": "nettoyant", "label": "Savon / Nettoyant"},
            {"slug": "huile-visage", "label": "Huile visage"},
            {"slug": "masque", "label": "Masque"},
            {"slug": "contour-yeux", "label": "Contour des yeux"},
            {"slug": "soin-levres", "label": "Soin lèvres"},
            {"slug": "exfoliant", "label": "Exfoliant / Gommage"},
            {"slug": "fond-de-teint", "label": "Fond de teint / BB cream"},
            {"slug": "demaquillant", "label": "Démaquillant"},
            {"slug": "brume", "label": "Brume / Eau thermale"},
            {"slug": "creme-solaire-visage", "label": "Crème solaire visage"},
        ],
        "problems": [
            {"slug": "acne", "label": "Acné / Peau acnéique"},
            {"slug": "pores", "label": "Pores dilatés"},
            {"slug": "taches", "label": "Taches & hyperpigmentation"},
            {"slug": "teint-terne", "label": "Teint terne / Sans éclat"},
            {"slug": "anti-age", "label": "Rides & anti-âge"},
            {"slug": "rougeurs", "label": "Rougeurs & couperose"},
            {"slug": "sensible", "label": "Peau sensible & réactive"},
            {"slug": "eczema", "label": "Eczéma"},
            {"slug": "psoriasis", "label": "Psoriasis"},
            {"slug": "vitiligo", "label": "Vitiligo"},
            {"slug": "deshydratee", "label": "Peau déshydratée"},
            {"slug": "sebum", "label": "Excès de sébum"},
            {"slug": "cernes", "label": "Cernes & poches"},
        ],
    },
    "corps": {
        "label": "Corps",
        "products": [
            {"slug": "creme-corps", "label": "Crème corps"},
            {"slug": "huile-corps", "label": "Huile corps"},
            {"slug": "gommage-corps", "label": "Gommage corps"},
            {"slug": "lait-corporel", "label": "Lait corporel"},
            {"slug": "beurre-corporel", "label": "Beurre corporel"},
            {"slug": "soin-mains", "label": "Soin mains & ongles"},
            {"slug": "soin-pieds", "label": "Soin pieds"},
            {"slug": "deodorant", "label": "Déodorant / Soin aisselles"},
            {"slug": "autobronzant", "label": "Autobronzant"},
            {"slug": "vergetures", "label": "Soin vergetures & cicatrices"},
            {"slug": "creme-solaire-corps", "label": "Crème solaire corps"},
            {"slug": "gel-douche", "label": "Gel douche / Savon corps"},
        ],
        "problems": [
            {"slug": "peau-seche", "label": "Peau sèche & tiraillements"},
            {"slug": "vergetures-prob", "label": "Vergetures"},
            {"slug": "cellulite", "label": "Cellulite"},
            {"slug": "taches-corps", "label": "Taches corporelles"},
            {"slug": "sensible-corps", "label": "Peau sensible"},
            {"slug": "acne-corps", "label": "Acné du corps"},
            {"slug": "transpiration", "label": "Transpiration excessive"},
        ],
    },
    "cosmetiques": {
        "label": "Cosmétiques",
        "products": [
            {"slug": "rouge-a-levres", "label": "Rouge à lèvres / Gloss"},
            {"slug": "fond-de-teint-cosmetique", "label": "Fond de teint & Correcteur"},
            {"slug": "palette-yeux", "label": "Palette yeux"},
            {"slug": "mascara", "label": "Mascara"},
            {"slug": "eyeliner", "label": "Eyeliner & Crayon yeux"},
            {"slug": "blush", "label": "Blush & Bronzer"},
            {"slug": "highlighter", "label": "Highlighter / Enlumineur"},
            {"slug": "poudre", "label": "Poudre (libre, compacte)"},
            {"slug": "contouring", "label": "Contouring"},
            {"slug": "sourcils", "label": "Sourcils"},
            {"slug": "primer", "label": "Base & Primer"},
            {"slug": "demaquillant-cosm", "label": "Démaquillant & Micellar"},
        ],
        "problems": [],
    },
    "cheveux": {
        "label": "Cheveux",
        "products": [
            {"slug": "shampoing", "label": "Shampoing"},
            {"slug": "apres-shampoing", "label": "Après-shampoing"},
            {"slug": "masque-cheveux", "label": "Masque cheveux"},
            {"slug": "huile-cheveux", "label": "Huile cheveux"},
            {"slug": "serum-cheveux", "label": "Sérum cheveux"},
            {"slug": "spray-coiffant", "label": "Spray coiffant"},
            {"slug": "shampoing-sec", "label": "Shampoing sec"},
            {"slug": "soin-anti-chute", "label": "Soin anti-chute"},
            {"slug": "soin-cheveux-colores", "label": "Soin cheveux colorés"},
            {"slug": "soin-cuir-chevelu", "label": "Soin cuir chevelu"},
        ],
        "problems": [
            {"slug": "chute", "label": "Chute de cheveux"},
            {"slug": "cheveux-gras", "label": "Cheveux gras"},
            {"slug": "cheveux-secs", "label": "Cheveux secs & abîmés"},
            {"slug": "pellicules", "label": "Pellicules"},
            {"slug": "cheveux-colores", "label": "Cheveux colorés & décolorés"},
            {"slug": "frisottis", "label": "Frisottis & rebelles"},
            {"slug": "manque-volume", "label": "Manque de volume"},
            {"slug": "cuir-chevelu-sensible", "label": "Cuir chevelu sensible"},
            {"slug": "pointes-fourchues", "label": "Pointes fourchues"},
        ],
    },
}
