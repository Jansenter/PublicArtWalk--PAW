# Artwork image acquisition

## Current result

The project already contains photos for 11 artwork IDs. Their presence in the repository is not evidence of permission; existing photo rights have not been audited by this change. The City export used by this project contains credits and registry links but no photo collection integrated into the app. No new City or Google photos were copied.

For full collection coverage, first ask the City public-art team whether it can supply a licensed image export and whether its permission covers the photographs and depicted artworks. Request photographer credits, permitted hosting/caching, resizing, public display, commercial use, and any expiry or attribution conditions. Do not assume that a data licence covers photographs linked from a registry.

Google Images can locate original sources, but each source's licence must be checked. Google Maps is not an open image library and restricts copying and mass downloading. Missing images should continue to use the decorative artwork covers and City registry links.

## Sources checked

- [City of Vancouver public art registry](https://covapp.vancouver.ca/PublicArtRegistry/HomePage.aspx)
- [Vancouver open-data licence](https://opendata.vancouver.ca/pages/licence/)
- [Google image usage-rights guidance](https://support.google.com/websearch/answer/29508?hl=en)
- [Google Maps terms](https://www.google.com/help/terms_maps/)
- [Copyright Board of Canada FAQ](https://cb-cda.gc.ca/en/faq)

The registry and open-data portal do not establish blanket permission for all artwork photographs in this review. Full photo acquisition remains pending verified licences or permission.

## Adding cleared photos

`Artwork.photos` accepts an array of `{ src, alt, credit?, sourceUrl?, license? }`. Record the source and permission evidence for each new image. Keep written permission evidence alongside the project documentation. Use descriptive alt text and a licence label that matches the actual grant.

The artwork story uses the full photo without cropping, caps its height to the viewport, and supports a horizontally scrollable gallery. Cards use the first photo. With no photos, existing local artwork mappings or decorative covers remain available. To avoid data regeneration removing photos, add durable image mappings to `artwalk/src/lib/artwork-photos.ts` or update the data generator before storing photos in generated JSON.
