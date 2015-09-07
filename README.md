# combinator
Combinator is a small javascript library for application shortcuts. Combinator was written with the end user in mind, simple practice and simple syntax.


##Table of Contents

####[Learn the basics:](#ltb)

* [Setting up](#settingup)
* [Syntax](#syntax)
* [Debugging](#debugging)

***


####[Latest Changes](#lc)
*[Change Log](#changelog)

***

####[Downloads](#downloads)
* [Latest Version](#latestver)

***

####[Support](#support)

***

#<a name="ltb">Learning The Basics</a>

## <a name="settingup"></a>Setting Up
  Setting up Combinator is very easy, first select which Combinator file you want, there are four. We have unminified Combinator with notes, minified Combinator, unminified Debugging Combinator, and minified Debugging Combinator. We separated the Debugging Combinator from the normal Combinator to save space for our users. 
  Once you have the file you want, add it to the head of your document. 
```html  
<head>
  <script src="directory/combinator.js"></script>
</head>
```

  Then you can create and add another file for creating your shortcuts (combinators) and listen for them. By creating a separate document you simple save yourself hassle of debugging your own mistakes.

```html
<script>
  commands.register("ctrl+x",{
    title:"Overwrite",
    exec:function(sequence) {
      //this = e of keydown event
      sequence("b",function(e){
        //e is the e of keydown event here
        //this is the object commands.cmd["ctrl+x"];
        console.log("Hello World");
      },document);
    },
    repeat: true,
    input: true,
    once: false,
    ignoreClass: false
  });
  
  //start the commands listener
  commands.listen();
</script>
```
  
## <a name="syntax"></a>Syntax

* [register](#register_syntax)
* [listen](#listen_syntax)
* [release](#release_syntax)
* [record](#record_syntax)
* [fetch](#fetch_syntax)
* [reset](#reset_syntax)
* [trigger](#trigger_syntax)
* [cmd](#cmd_syntax)


<a name="register_syntax">Register</a>
```js
combinator.register(keys,options);
```

**keys** is a pattern of keys to match against for example <kbd>ctrl</kbd>+<kbd>x</kbd> and must be a string format.
**options** there are a set of options you must know to understand combinator.

* [exec](#exec)
* [title](#title)
* [repeat](#repeat)
* [input](#input)
* [once](#once)
* [ignoreClass](#ignoreClass)


<a name="exec">exec</a>
The exec (execute) property is the main function that will be executed when your combinator is pressed. It takes one argument which is a sequence to listen for after.

Example:

```js
exec:function(sequence) {
  sequence("a",function(e){
    //this = this command that is running so it returns the object
    console.log(e.target);
  },document);
}
```

`sequence(key,callback[,target]);`

sequence argument/function takes three properties, a key to listen for, a callback function, then a target that you want this key to be listened to on. Default target is document. For example if you were listening to the main command on document and you wanted to wait for a key in a textarea you could do as follows:

Example different listening targets:

```js

"ctrl+b": {
  title:"mainListener",
  exec:function(sequence) {
    sequence("x",function(e){
      console.log(e);
    },document.getElementById("ourTextarea");
  }
}
...

combinator.listen(document);
```

This would be when you press <kbd>ctrl</kbd>+<kbd>b</kbd> in the document area and then pressed <kbd>x</kbd> while inside the element `<textarea id="ourTextarea"></textarea>` the developer console would then log the event object.

<a name="listen_syntax">Listen</a>
```js
combinator.listen()
```
listen takes no arguments


<a name="release_syntax">Release</a>
```js
combinator.release(keys);
```

You **MUST** release a combinator set if you plan on overwriting it, we don't allow overwrites because this helps incase you forget some of your combinator sets.

<a name="record_syntax">Record</a>
```js
combinator.record(function[,target]);
```
<a name="fetch_syntax">fetch</a>
    combinator.fetch(keys);
Just like `register` this must be a pattern of keys to match against in string format, and must exists as a combinator set.

<a name="reset_syntax">reset</a>
    combinator.reset(keys);
Just like `register` and `fetch` this must be a pattern of keys to match against in string format, and must exists as a combinator set.

<a name="trigger_syntax">trigger</a>
    combinator.trigger(keys);
Just like `register`,`fetch`, and `reset` this must be a pattern of keys to match against in string format, and must exists as a combinator set.


<a name="cmd_syntax">cmd</a>
    combinator.cmd
This property of `combinator` is very useful, you can grab your combinator sets like this, or you can also set them like this as well. 

**Example**

    combinator.cmd = {
        "ctrl+x":{
            title:"Overwrite",
            exec:function(sequence) {
                //this = e of keydown event
                sequence("b",function(e){
                    //e is the e of keydown event here
                    //this is the object commands.cmd["ctrl+x"];
                    console.log("Hello World");
               },document);
            },
            repeat: true,
            input: true,
            once: false,
            ignoreClass: false
        }
    };


<a name="debugging"></a>Debugging
If you have the Debugging Combinator you'll then get an extra property attached to `combinator`.

Example:

    combinator.debug = true;
    
This turns debugging messages on through out the code helping you incase something is ary. 
****

#<a name="lc">Latest Changes</a>

* Added record functionality for ease of access to the user.
* Fixed minor issues.

***

#<a name="downloads">Downloads</a>
* [Latest Unminified](/blob/master/combinator.js)
* [Latest Unminified Debug](/blob/master/combinator.js)
* [Latest Minified](/blob/master/combinator.js)
* [Latest Minified Debug](/blob/master/combinator.js)


#<a name="support">Support</a>
