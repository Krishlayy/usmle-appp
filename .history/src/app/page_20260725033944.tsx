import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView } from "framer-motion"

/**
 * User request: Create a new Framer code component named “QBank Home Layout” that recreates the existing Home page as a single self-contained, full-width responsive landing layout. Do not modify any current canvas layers.
 * Match a warm-white editorial hero with top navigation, outline eyebrow pill, split-style headline, dual CTAs, three feature cards, dark navy callout, and restrained footer. Make all visible content and links editable via property controls, include editable color system and corner radius, use package-free inline SVG icons, and support optional on-view entrance animation with static renderer safety.
 */

interface NavItem {
    label: string
    href: string
}

interface FeatureItem {
    icon: "content" | "analytics" | "purchase"
    tileColor: string
    title: string
    description: string
}

interface FooterLinkItem {
    label: string
    href: string
}

interface FontControlValue {
    fontSize?: string | number
    lineHeight?: string | number
    letterSpacing?: string | number
    textAlign?: "left" | "center" | "right"
    fontWeight?: number
    fontStyle?: "normal" | "italic"
    fontFamily?: string
    variant?: string
}

interface MyComponentProps {
    brand: string
    navItems: NavItem[]
    eyebrow: string
    emphasizedHeading: string
    headingRemainder: string
    supportingParagraph: string
    primaryButtonLabel: string
    primaryButtonHref: string
    secondaryButtonLabel: string
    secondaryButtonHref: string
    features: FeatureItem[]
    calloutTitle: string
    calloutBody: string
    calloutButtonLabel: string
    calloutButtonHref: string
    footerBrand: string
    footerLinks: FooterLinkItem[]
    footerCopyright: string
    animateOnView: boolean
    pageBackground: string
    accentYellow: string
    aqua: string
    navy: string
    cardSurface: string
    sectionSurface: string
    primaryText: string
    mutedText: string
    borderColor: string
    radius: string
    headingFont: FontControlValue
    emphasizedFont: FontControlValue
    bodyFont: FontControlValue
}

function BookIcon({ color }: { color: string }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <path
                d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v16.5a1.5 1.5 0 0 1-1.5 1.5H6.5A2.5 2.5 0 0 1 4 17.5V4.5Zm2.5-.5a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5H18V4H6.5Z"
                fill={color}
            />
        </svg>
    )
}

function ArrowIcon({ color }: { color: string }) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <path
                d="M5 12h12.17l-4.58 4.59L14 18l7-7-7-7-1.41 1.41L17.17 10H5v2Z"
                fill={color}
            />
        </svg>
    )
}

function FeatureIcon({
    variant,
    color,
}: {
    variant: "content" | "analytics" | "purchase"
    color: string
}) {
    if (variant === "content") {
        return (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <path
                    d="M6 3h12a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V5a2 2 0 0 1 2-2Zm0 2v10.76l2-.99 4 2 4-2 2 .99V5H6Z"
                    fill={color}
                />
            </svg>
        )
    }
    if (variant === "analytics") {
        return (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ display: "block" }}
            >
                <path
                    d="M4 19h16v2H2V3h2v16Zm3-2V9h3v8H7Zm5 0V5h3v12h-3Zm5 0v-6h3v6h-3Z"
                    fill={color}
                />
            </svg>
        )
    }
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
            style={{ display: "block" }}
        >
            <path
                d="M7 4h10l3 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8l3-4Zm1.05 2L6.5 8h11L16 6H8.05ZM12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                fill={color}
            />
        </svg>
    )
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function QBankHomeLayout(props: MyComponentProps) {
    const {
        brand,
        navItems,
        eyebrow,
        emphasizedHeading,
        headingRemainder,
        supportingParagraph,
        primaryButtonLabel,
        primaryButtonHref,
        secondaryButtonLabel,
        secondaryButtonHref,
        features,
        calloutTitle,
        calloutBody,
        calloutButtonLabel,
        calloutButtonHref,
        footerBrand,
        footerLinks,
        footerCopyright,
        animateOnView,
        pageBackground,
        accentYellow,
        aqua,
        navy,
        cardSurface,
        sectionSurface,
        primaryText,
        mutedText,
        borderColor,
        radius,
        headingFont,
        emphasizedFont,
        bodyFont,
    } = props

    const rootRef = React.useRef<HTMLDivElement | null>(null)
    const inView = useInView(rootRef, { once: true, amount: 0.2 })
    const isStatic = useIsStaticRenderer()
    const shouldAnimate = animateOnView && !isStatic && inView

    const headingStyle = React.useMemo<React.CSSProperties>(
        () => ({
            fontSize: headingFont?.fontSize,
            lineHeight: headingFont?.lineHeight,
            letterSpacing: headingFont?.letterSpacing,
            textAlign: headingFont?.textAlign,
            fontWeight: headingFont?.fontWeight,
            fontStyle: headingFont?.fontStyle,
            fontFamily: headingFont?.fontFamily,
        }),
        [headingFont]
    )

    const emphasizedStyle = React.useMemo<React.CSSProperties>(
        () => ({
            fontSize: emphasizedFont?.fontSize,
            lineHeight: emphasizedFont?.lineHeight,
            letterSpacing: emphasizedFont?.letterSpacing,
            textAlign: emphasizedFont?.textAlign,
            fontWeight: emphasizedFont?.fontWeight,
            fontStyle: emphasizedFont?.fontStyle,
            fontFamily: emphasizedFont?.fontFamily,
        }),
        [emphasizedFont]
    )

    const bodyStyle = React.useMemo<React.CSSProperties>(
        () => ({
            fontSize: bodyFont?.fontSize,
            lineHeight: bodyFont?.lineHeight,
            letterSpacing: bodyFont?.letterSpacing,
            textAlign: bodyFont?.textAlign,
            fontWeight: bodyFont?.fontWeight,
            fontStyle: bodyFont?.fontStyle,
            fontFamily: bodyFont?.fontFamily,
        }),
        [bodyFont]
    )

    const shownFeatures = features.slice(0, 3)

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                background: pageBackground,
                color: primaryText,
                boxSizing: "border-box",
                overflowX: "hidden",
            }}
        >
            <header
                style={{
                    width: "100%",
                    padding: "20px 20px 8px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: 1120,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <BookIcon color={primaryText} />
                        <span
                            style={{
                                ...bodyStyle,
                                fontWeight: 700,
                                minWidth: "max-content",
                            }}
                        >
                            {brand}
                        </span>
                    </div>
                    <nav
                        aria-label="Top navigation"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 18,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                        }}
                    >
                        {navItems.map((item, index) => (
                            <a
                                key={`${item.label}-${index}`}
                                href={item.href}
                                style={{
                                    ...bodyStyle,
                                    color: primaryText,
                                    textDecoration: "none",
                                }}
                                aria-label={item.label}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                </div>
            </header>

            <main
                style={{
                    width: "100%",
                    padding: "18px 20px 60px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: 1120,
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 56,
                    }}
                >
                    <section
                        style={{
                            position: "relative",
                            borderRadius: radius,
                            padding: "74px 20px 70px",
                            textAlign: "center",
                            overflow: "hidden",
                        }}
                    >
                        <div
                            aria-hidden="true"
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: 0,
                                width: "58%",
                                minWidth: 280,
                                transform: "translateX(-50%)",
                                height: 230,
                                background: `radial-gradient(circle at center, ${aqua}24 0%, transparent 70%)`,
                                pointerEvents: "none",
                            }}
                        />
                        <motion.div
                            initial={
                                shouldAnimate ? { opacity: 0, y: 14 } : false
                            }
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            style={{
                                position: "relative",
                                zIndex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 22,
                            }}
                        >
                            <span
                                style={{
                                    ...bodyStyle,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 8,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: 999,
                                    padding: "7px 12px",
                                    textTransform: "uppercase",
                                    color: mutedText,
                                    letterSpacing: "0.06em",
                                    fontSize: 12,
                                    lineHeight: "1em",
                                }}
                            >
                                <span
                                    aria-hidden="true"
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: 999,
                                        background: accentYellow,
                                        display: "inline-block",
                                    }}
                                />
                                {eyebrow}
                            </span>

                            <h1
                                style={{
                                    ...headingStyle,
                                    margin: 0,
                                    color: primaryText,
                                    maxWidth: 820,
                                }}
                            >
                                <span
                                    style={{
                                        ...emphasizedStyle,
                                        marginRight: 8,
                                    }}
                                >
                                    {emphasizedHeading}
                                </span>
                                <br />
                                {headingRemainder}
                            </h1>

                            <p
                                style={{
                                    ...bodyStyle,
                                    margin: 0,
                                    color: mutedText,
                                    maxWidth: 680,
                                }}
                            >
                                {supportingParagraph}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 12,
                                    flexWrap: "wrap",
                                    width: "100%",
                                }}
                            >
                                <a
                                    href={primaryButtonHref}
                                    aria-label={primaryButtonLabel}
                                    style={{
                                        ...bodyStyle,
                                        minHeight: 50,
                                        minWidth: 210,
                                        padding: "12px 18px",
                                        borderRadius: radius,
                                        border: "1px solid #000000",
                                        background: "#000000",
                                        color: "#FFFFFF",
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: 8,
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <span>{primaryButtonLabel}</span>
                                    <ArrowIcon color="#FFFFFF" />
                                </a>
                                <a
                                    href={secondaryButtonHref}
                                    aria-label={secondaryButtonLabel}
                                    style={{
                                        ...bodyStyle,
                                        minHeight: 50,
                                        minWidth: 210,
                                        padding: "12px 18px",
                                        borderRadius: radius,
                                        border: `1px solid ${borderColor}`,
                                        background: accentYellow,
                                        color: primaryText,
                                        textDecoration: "none",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    {secondaryButtonLabel}
                                </a>
                            </div>
                        </motion.div>
                    </section>

                    <section
                        style={{
                            background: sectionSurface,
                            borderRadius: radius,
                            padding: "28px 18px",
                            boxSizing: "border-box",
                        }}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(auto-fit, minmax(240px, 1fr))",
                                gap: 16,
                            }}
                        >
                            {shownFeatures.map((feature, index) => (
                                <motion.article
                                    key={`${feature.title}-${index}`}
                                    initial={
                                        shouldAnimate
                                            ? { opacity: 0, y: 12 }
                                            : false
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        delay: 0.06 * index,
                                        ease: "easeOut",
                                    }}
                                    style={{
                                        background: cardSurface,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: radius,
                                        padding: "24px 20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 14,
                                        minWidth: 0,
                                    }}
                                >
                                    <span
                                        aria-hidden="true"
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            background: feature.tileColor,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <FeatureIcon
                                            variant={feature.icon}
                                            color={primaryText}
                                        />
                                    </span>
                                    <h3
                                        style={{
                                            ...bodyStyle,
                                            margin: 0,
                                            color: primaryText,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {feature.title}
                                    </h3>
                                    <p
                                        style={{
                                            ...bodyStyle,
                                            margin: 0,
                                            color: mutedText,
                                        }}
                                    >
                                        {feature.description}
                                    </p>
                                </motion.article>
                            ))}
                        </div>
                    </section>

                    <motion.section
                        initial={shouldAnimate ? { opacity: 0, y: 12 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.4,
                            ease: "easeOut",
                            delay: 0.08,
                        }}
                        style={{
                            width: "100%",
                            background: navy,
                            borderRadius: radius,
                            padding: "28px 24px",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 20,
                            flexWrap: "wrap",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                minWidth: 0,
                                flex: "1 1 360px",
                            }}
                        >
                            <h3
                                style={{
                                    ...headingStyle,
                                    margin: 0,
                                    color: "#FFFFFF",
                                    fontSize: "clamp(24px, 3.3vw, 38px)",
                                    lineHeight: "1.08em",
                                }}
                            >
                                {calloutTitle}
                            </h3>
                            <p
                                style={{
                                    ...bodyStyle,
                                    margin: 0,
                                    color: "#D5DCE8",
                                    maxWidth: 620,
                                }}
                            >
                                {calloutBody}
                            </p>
                        </div>
                        <a
                            href={calloutButtonHref}
                            aria-label={calloutButtonLabel}
                            style={{
                                ...bodyStyle,
                                background: aqua,
                                color: navy,
                                textDecoration: "none",
                                borderRadius: radius,
                                border: `1px solid ${aqua}`,
                                minHeight: 48,
                                minWidth: 220,
                                padding: "12px 16px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                boxSizing: "border-box",
                            }}
                        >
                            <span>{calloutButtonLabel}</span>
                            <ArrowIcon color={navy} />
                        </a>
                    </motion.section>
                </div>
            </main>

            <footer
                style={{
                    width: "100%",
                    background: sectionSurface,
                    borderTop: `1px solid ${borderColor}`,
                    padding: "20px",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        maxWidth: 1120,
                        margin: "0 auto",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                        }}
                    >
                        <BookIcon color={primaryText} />
                        <span
                            style={{
                                ...bodyStyle,
                                color: primaryText,
                                fontWeight: 700,
                            }}
                        >
                            {footerBrand}
                        </span>
                    </div>
                    <nav
                        aria-label="Footer links"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 14,
                            flexWrap: "wrap",
                        }}
                    >
                        {footerLinks.map((item, index) => (
                            <a
                                key={`${item.label}-${index}`}
                                href={item.href}
                                style={{
                                    ...bodyStyle,
                                    color: mutedText,
                                    textDecoration: "none",
                                }}
                                aria-label={item.label}
                            >
                                {item.label}
                            </a>
                        ))}
                    </nav>
                    <span style={{ ...bodyStyle, color: mutedText }}>
                        {footerCopyright}
                    </span>
                </div>
            </footer>
        </div>
    )
}

addPropertyControls(QBankHomeLayout, {
    brand: {
        type: ControlType.String,
        title: "Brand",
        defaultValue: "Micro Q Bank",
    },
    navItems: {
        type: ControlType.Array,
        title: "Nav",
        defaultValue: [
            { label: "Dashboard", href: "#" },
            { label: "Admin", href: "#" },
            { label: "Log Out", href: "#" },
        ],
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "Dashboard" },
                href: { type: ControlType.Link, defaultValue: "#" },
            },
        },
        maxCount: 6,
    },
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "THE NEW STANDARD IN CLINICAL EDUCATION",
    },
    emphasizedHeading: {
        type: ControlType.String,
        title: "Emphasis",
        defaultValue: "Master",
    },
    headingRemainder: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Medical Concepts, One Topic at a Time.",
    },
    supportingParagraph: {
        type: ControlType.String,
        title: "Body",
        defaultValue:
            "Micro Q Bank gives modern learners focused question banks, precise analytics, and flexible module-based access to improve clinical confidence.",
        displayTextArea: true,
    },
    primaryButtonLabel: {
        type: ControlType.String,
        title: "Primary CTA",
        defaultValue: "Start Learning",
    },
    primaryButtonHref: {
        type: ControlType.Link,
        title: "Primary URL",
        defaultValue: "#",
    },
    secondaryButtonLabel: {
        type: ControlType.String,
        title: "Secondary CTA",
        defaultValue: "Explore Modules",
    },
    secondaryButtonHref: {
        type: ControlType.Link,
        title: "Secondary URL",
        defaultValue: "#",
    },
    features: {
        type: ControlType.Array,
        title: "Features",
        defaultValue: [
            {
                icon: "content",
                tileColor: "#FEF3C7",
                title: "High-Yield Content",
                description:
                    "Concise, clinically relevant question sets built to reinforce core concepts efficiently.",
            },
            {
                icon: "analytics",
                tileColor: "#CFFAFE",
                title: "Advanced Analytics",
                description:
                    "Track weak areas and improvement trends with actionable, learner-friendly insights.",
            },
            {
                icon: "purchase",
                tileColor: "#EDE9FE",
                title: "Pay Per Module",
                description:
                    "Purchase only the specialties you need and scale your study plan over time.",
            },
        ],
        control: {
            type: ControlType.Object,
            controls: {
                icon: {
                    type: ControlType.Enum,
                    options: ["content", "analytics", "purchase"],
                    optionTitles: ["Content", "Analytics", "Purchase"],
                    defaultValue: "content",
                },
                tileColor: { type: ControlType.Color, defaultValue: "#FEF3C7" },
                title: {
                    type: ControlType.String,
                    defaultValue: "Feature Title",
                },
                description: {
                    type: ControlType.String,
                    defaultValue: "Feature description",
                    displayTextArea: true,
                },
            },
        },
        maxCount: 3,
    },
    calloutTitle: {
        type: ControlType.String,
        title: "Callout Title",
        defaultValue: "Ready to elevate your clinical study?",
    },
    calloutBody: {
        type: ControlType.String,
        title: "Callout Body",
        defaultValue:
            "Join a smarter question-bank experience designed for focused learning and measurable growth.",
        displayTextArea: true,
    },
    calloutButtonLabel: {
        type: ControlType.String,
        title: "Callout CTA",
        defaultValue: "Get Started Today",
    },
    calloutButtonHref: {
        type: ControlType.Link,
        title: "Callout URL",
        defaultValue: "#",
    },
    footerBrand: {
        type: ControlType.String,
        title: "Footer Brand",
        defaultValue: "Micro Q Bank",
    },
    footerLinks: {
        type: ControlType.Array,
        title: "Footer Links",
        defaultValue: [
            { label: "Legal", href: "#" },
            { label: "Support", href: "#" },
            { label: "Contact", href: "#" },
        ],
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "Legal" },
                href: { type: ControlType.Link, defaultValue: "#" },
            },
        },
        maxCount: 6,
    },
    footerCopyright: {
        type: ControlType.String,
        title: "Copyright",
        defaultValue: "© 2026 Micro Q Bank. All rights reserved.",
    },
    animateOnView: {
        type: ControlType.Boolean,
        title: "Animate",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    pageBackground: {
        type: ControlType.Color,
        title: "Page BG",
        defaultValue: "#FFFFFF",
    },
    accentYellow: {
        type: ControlType.Color,
        title: "Yellow",
        defaultValue: "#FEF3C7",
    },
    aqua: {
        type: ControlType.Color,
        title: "Aqua",
        defaultValue: "#67E8F9",
    },
    navy: {
        type: ControlType.Color,
        title: "Navy",
        defaultValue: "#0F172A",
    },
    cardSurface: {
        type: ControlType.Color,
        title: "Card Surface",
        defaultValue: "#FFFFFF",
    },
    sectionSurface: {
        type: ControlType.Color,
        title: "Section BG",
        defaultValue: "#F5F5F5",
    },
    primaryText: {
        type: ControlType.Color,
        title: "Primary Text",
        defaultValue: "#000000",
    },
    mutedText: {
        type: ControlType.Color,
        title: "Muted Text",
        defaultValue: "#CCCCCC",
    },
    borderColor: {
        type: ControlType.Color,
        title: "Border",
        defaultValue: "#EEEEEE",
    },
    radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "14px",
    },
    headingFont: {
        type: ControlType.Font,
        title: "Heading Font",
        defaultValue: {
            fontSize: "56px",
            variant: "Semibold",
            letterSpacing: "-0.04em",
            lineHeight: "1em",
            textAlign: "center",
        },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    emphasizedFont: {
        type: ControlType.Font,
        title: "Emphasis Font",
        defaultValue: {
            fontSize: "56px",
            variant: "Regular Italic",
            letterSpacing: "-0.03em",
            lineHeight: "1em",
            textAlign: "center",
        },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
    bodyFont: {
        type: ControlType.Font,
        title: "Body Font",
        defaultValue: {
            fontSize: "16px",
            variant: "Medium",
            letterSpacing: "-0.01em",
            lineHeight: "1.35em",
            textAlign: "center",
        },
        controls: "extended",
        defaultFontType: "sans-serif",
    },
})
