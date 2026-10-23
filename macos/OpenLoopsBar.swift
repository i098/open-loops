// Open Loops menu bar item: shows how many loops are waiting and opens the companion.
// Build: swiftc -parse-as-library -O macos/OpenLoopsBar.swift -o macos/OpenLoopsBar && macos/OpenLoopsBar
import AppKit
import SwiftUI

struct Status: Decodable {
  struct Row: Decodable { let AT: String?; let LOOP_ID: String?; let EVENT: String?; let DETAIL: String? }
  let evidence: String
  let model: String?
  let journal: [Row]
}

@MainActor
final class Model: ObservableObject {
  @Published var status: Status?
  @Published var error: String?
  let base = URL(string: ProcessInfo.processInfo.environment["OPEN_LOOPS_URL"] ?? "http://127.0.0.1:4317")!
  init() {
    Task { while true { await refresh(); try? await Task.sleep(for: .seconds(3)) } }
  }
  func refresh() async {
    do {
      let (data, _) = try await URLSession.shared.data(from: base.appending(path: "api/backend"))
      status = try JSONDecoder().decode(Status.self, from: data)
      error = nil
    } catch { self.error = "Server not running" }
  }
  var cards: Int { Set(status?.journal.filter { $0.EVENT == "card_pack" }.compactMap(\.LOOP_ID) ?? []).count }
  func open(_ path: String) { NSWorkspace.shared.open(base.appending(path: path)) }
}

@main
struct OpenLoopsBar: App {
  @StateObject private var model = Model()
  init() { NSApplication.shared.setActivationPolicy(.accessory) }
  var body: some Scene {
    MenuBarExtra {
      if let s = model.status {
        Text("Evidence: \(s.evidence)")
        Text("Model: \(s.model ?? "none")")
        Divider()
        ForEach(Array(s.journal.prefix(6).enumerated()), id: \.offset) { _, r in
          Text("\(r.AT ?? "") \(r.LOOP_ID ?? "") · \(r.EVENT ?? "") · \(r.DETAIL ?? "")").lineLimit(1)
        }
      } else {
        Text(model.error ?? "Connecting…")
      }
      Divider()
      Button("Open companion") { model.open("open-loops.html") }.keyboardShortcut("o")
      Button("Open backend view") { model.open("backend") }.keyboardShortcut("b")
      Divider()
      Button("Quit") { NSApplication.shared.terminate(nil) }.keyboardShortcut("q")
    } label: {
      Label("\(model.cards)", systemImage: "circle.dashed")
    }
  }
}
