function showContextMenu(e, div, messageId) {
  const elementWithContextMenu = document.querySelectorAll(
    '[id*="contextMenu"]'
  );
  const chatDiv = document.getElementById("container");
  elementWithContextMenu.forEach((ctxMenu) => {
    if (
      ctxMenu.id !== `contextMenu-${messageId}` &&
      ctxMenu.style.display === "block"
    ) {
      ctxMenu.style.display = "none";
    }
  });
  const contextMenu = document.getElementById(`contextMenu-${messageId}`);
  e.preventDefault();
  const rect = div.getBoundingClientRect();

  let parentTop = chatDiv.getBoundingClientRect().top + window.scrollY;
  let childTop = div.getBoundingClientRect().top + window.scrollY;
  let mgnTop;
  if (childTop - parentTop > 0 || childTop - parentTop > 200) {
    mgnTop = rect.top + window.scrollY + "px";
    console.log(childTop - parentTop);
  } else {
    mgnTop = rect.top + window.scrollY + rect.height + "px";
  }

  contextMenu.style.left = rect.left + window.scrollX + "px";
  contextMenu.style.top = mgnTop;
  if (contextMenu.style.display !== "block") {
    contextMenu.style.display = "block";
  }
  chatDiv.style.overflowY = "hidden";
}

function hideContextMenu(messageId) {
  const contextMenu = document.getElementById(`contextMenu-${messageId}`);
  const chatDiv = document.getElementById("container");
  if (contextMenu) {
    contextMenu.style.display = "none";
    chatDiv.style.overflowY = "scroll";
  }
}

export { showContextMenu, hideContextMenu };
