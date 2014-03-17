# SASE.js

SASE.js enabled Complex Event Processing in JavaScript. It is an implementation of the SASE language as defined in [this paper](https://www.cs.duke.edu/courses/spring08/cps399.28/papers/sigmod06-DiaoEtAl-event_processing_over_stream.pdf) by Eugene Wu et al.

It allows you to map sequences of events into higher-order events, with support for negative events, time windows, and more. For example, you could detect stolen goods by finding items that leave the shelf without being paid for:

```
var stolenGoods = new Cursor({name: "stolen_good"})
  .seq("left_shelf", neg("checkout"), "left_store")
  .where(function(leftShelf, checkout, leftStore) {
    var sameItem = leftShelf.id == leftStore.id;
    var missingCheckout = checkout == null ||
                          checkout.id != leftShelf.id);
    return sameItem && missingCheckout;
  })
  .within(60 * time.minutes);
```