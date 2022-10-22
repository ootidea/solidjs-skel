import { createEffect, createSignal, on, Show } from "solid-js";
import css from "./ScaleAnimation.scss";
import { prepareProps, SkelProps, SkelSlot } from "./utility/props";
import { registerCss } from "./utility/registerCss";
import { Slot } from "./utility/Slot";

registerCss(css);

export type ScaleProps = SkelProps<{
  shown?: boolean;
  options?: number | KeyframeAnimationOptions;
  onFinishAnimation?: (type: "enter" | "leave") => void;
  launcher?: SkelSlot<{ show: () => void; hide: () => void; toggle: () => void }>;
  children?: SkelSlot<{ show: () => void; hide: () => void; toggle: () => void }>;
}>;

export function ScaleAnimation(rawProps: ScaleProps) {
  const [props, restProps] = prepareProps(rawProps, { shown: true, options: 250 }, [
    "onFinishAnimation",
    "launcher",
    "children",
  ]);

  let element: HTMLDivElement | undefined;

  // Signal variable indicating whether props.children should be present on the DOM.
  const [shown, setShown] = createSignal(props.shown);

  // Signal variable to use the defer option for props.shown.
  const [bindingShown, setBindingShown] = createSignal(props.shown);
  createEffect(() => setBindingShown(props.shown));

  // Animate when props.shown is changed.
  createEffect(on(bindingShown, (newShown) => changeShown(newShown), { defer: true }));

  function changeShown(newShown: boolean) {
    if (newShown === shown()) return;

    if (!newShown) {
      if (element !== undefined) {
        const animation = element.animate(
          [{ transform: "scale(1)" }, { transform: "scale(0)" }],
          props.options,
        );
        animation.addEventListener("finish", () => {
          setShown(newShown);
          props.onFinishAnimation?.("leave");
        });
      }
    } else {
      setShown(newShown);
      const animation = element?.animate(
        [{ transform: "scale(0)" }, { transform: "scale(1)" }],
        props.options,
      );
      animation?.addEventListener("finish", () => {
        props.onFinishAnimation?.("enter");
      });
    }
  }
  const show = () => changeShown(true);
  const hide = () => changeShown(false);
  const toggle = () => changeShown(!shown());

  return (
    <>
      <Slot content={props.launcher} params={{ show, hide, toggle }} />
      <div class="skel-ScaleAnimation_root" ref={element}>
        <Show when={shown()}>
          <Slot content={props.children} params={{ show, hide, toggle }} />
        </Show>
      </div>
    </>
  );
}