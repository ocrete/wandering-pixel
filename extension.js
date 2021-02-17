/* extension.js
 *
 */

/* exported init */

const Lang = imports.lang;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;

class Extension {
  constructor() {
    //log("entering constructor");
    this.monitor = Main.layoutManager.primaryMonitor;
    this.size = 1; // size of the pixel
    this.delay = 60; // how many seconds to take for the pixel to move across the entire screen
    this.goLeft = null; // whether or not to go left next time we change directions
    this.pixel = null; // the pixel
    this._timeout = null; // timeout for when to change directions
    //log("exiting constructor");
  }

  _changeDirection() {
    //log("in _changeDirection");
    //let [xPos, yPos] = this.pixel.get_position();
    //log(xPos);
    let newX = (this.goLeft) ? 0 : this.monitor.width - this.size;

    if (this.pixel !== null) {
      //log("in _changeDirection (this.pixel not null)");
      //let [xPos, yPos] = this.pixel.get_position();
      //log(xPos);
      this.pixel.ease({
        x: newX,
        //opacity: 100,
        duration: this.delay * 1000,
        mode: Clutter.AnimationMode.LINEAR
      });
      this.goLeft = !this.goLeft;
      //log("in _changeDirection - done with this.pixel.ease");
      //[xPos, yPos] = this.pixel.get_position();
      //log(xPos);
      this._timeout = Mainloop.timeout_add_seconds(this.delay, Lang.bind(this, this._changeDirection));
    }
  }

  enable() {
    //log("entering enable");
    this.goLeft = false; // start at left, so go right first
    this.pixel = new St.Bin({
      style: 'background-color: #101010', // #101010 - very slightly less dark than the top bar
      x: 0, //start at left
      y: 0,
      reactive: false,
      can_focus: false,
      track_hover: false,
      width: this.size,
      height: this.size,
    });

    Main.layoutManager.addChrome(this.pixel, {
      affectsInputRegion: true,
      trackFullscreen: true,
    });

    // if we don't wait, for some reason the first call to _changeDirection doesn't seem to respect duration and the pixel won't move for the entire first iteration
    this._timeout = Mainloop.timeout_add_seconds(1, Lang.bind(this, this._changeDirection));
    //log("exiting enable");
  }

  disable() {
    //log("entering disable");
    if (this._timeout !== null) {
      Mainloop.source_remove(this._timeout);
      this._timeout = null;
    }
    Main.layoutManager.removeChrome(this.pixel);
    this.pixel = null;
    //log("exiting disable");
  }
}

function init() {
  return new Extension();
}
