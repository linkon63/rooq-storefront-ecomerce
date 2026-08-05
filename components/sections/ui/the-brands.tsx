import Image from "next/image";

export default function TheBrands() {
  return (
    <section className="w-full bg-[#F6F6F6] py-16 px-6 md:px-12 lg:py-44"  style={{
          clipPath: "ellipse(95% 100% at 50% 0%)",
        }}>
      <div className="thebrands-wrapper">
        <div className="container mx-auto px-3">
          {/* Top Section - The Brand */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl">
                <span className="font-['Snell_Roundhand_LT_Std'] font-medium text-brand-primary">The </span>
                <span className="font-['Snell_Roundhand_LT_Std'] italic text-brand-primary">Brand</span>
              </h2>
              
              <p className="mt-6 font-['Bembo_Std'] text-lg font-normal leading-6">
                Organishi offers pure, fresh, and high-quality organic food products sourced directly from farms. For over 
                two decades, the brand has evolved and carved an enviable niche in the natural food 
                market. Here, quality is experienced through the richness of purity and authenticity, 
                discovered in the beauty of nature and delivered with care.
              </p>
              
              <p className="mt-4 font-['Bembo_Std'] text-lg font-normal">
                No one delivers that kind of organic experience quite like Organishi.
              </p>

              {/* Two Small Images with Our Promise */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="overflow-hidden">
                  <Image
                    src="/images/brands/images-1.png"
                    alt="Brand showcase 1"
                    width={340}
                    height={400}
                    className=" object-contain"
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <div className="overflow-hidden">
                    <Image
                      src="/images/brands/images-2.png"
                      alt="Brand showcase 2"
                      width={292}
                      height={364}
                      className="object-contain"
                    />
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl">
                    <span className="font-['Snell_Roundhand_LT_Std'] font-medium text-brand-primary">Our </span>
                    <span className="font-['Snell_Roundhand_LT_Std'] italic text-brand-primary">Promise</span>
                  </h2>
                </div>
              </div>
            </div>

            {/* Right Side - Large Image */}
            <div className="overflow-hidden">
              <Image
                src="/images/brands/images-3.png"
                alt="Brand showcase 3"
                width={600}
                height={800}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Description Section */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <p className="font-['Bembo_Std'] text-lg font-normal leading-6">
                Organishi presents an exceptional prospect to build on the brand and succeed in 
                maintaining a trusted presence. Serving a growing market for organic food, Organishi 
                delivers direct farm-to-table products with transparency and quality.
              </p>
            </div>
            <div>
              <p className="font-['Bembo_Std'] text-lg font-normal leading-6">
                Organishi offers a kind of purity and depth of flavor where 
                simplicity speaks volumes and customers get the authentic quality they desire. 
                For Organishi is poised for growth and distinction in healthy living.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
