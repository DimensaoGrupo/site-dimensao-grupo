import sharp from "sharp";

// libvips (sharp's backend) caches recently-read files internally for
// performance, which on Windows can hold an OS-level handle on a file well
// after the metadata/resize call that touched it has returned — a
// subsequent fs.unlink() on that same file then fails with EBUSY, even
// though nothing in this codebase is knowingly holding it open. Confirmed
// empirically: deleting a just-listed media file failed with EBUSY while
// the server was running, and succeeded immediately once the server (the
// only other thing that had touched the file, via listMediaFiles' per-file
// sharp().metadata() calls) was stopped. Disabling the cache trades a small
// amount of repeat-read performance for files always being safely
// deletable while the server is running.
sharp.cache(false);

export { sharp };
